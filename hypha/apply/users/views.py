from django.contrib import messages
from django.contrib.auth import get_user_model, login, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AdminPasswordChangeForm
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404, redirect, render
from django.template.response import TemplateResponse
from django.urls import reverse, reverse_lazy
from django.utils.decorators import method_decorator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.utils.translation import gettext_lazy as _
from django.views.generic import UpdateView
from django.views.generic.base import TemplateView
from django.views.generic.edit import FormView
from hijack.views import login_with_id
from two_factor.forms import AuthenticationTokenForm, BackupTokenForm
from two_factor.views import LoginView as TwoFactorLoginView
from urllib.parse import urlencode
from wagtail.admin.views.account import password_management_enabled

from .decorators import require_oauth_whitelist
from .forms import BecomeUserForm, CustomAuthenticationForm, ProfileForm, PasswordForm

User = get_user_model()


class LoginView(TwoFactorLoginView):
    form_list = (
        ('auth', CustomAuthenticationForm),
        ('token', AuthenticationTokenForm),
        ('backup', BackupTokenForm),
    )


@method_decorator(login_required, name='dispatch')
class AccountView(UpdateView):
    form_class = ProfileForm
    template_name = 'users/account.html'

    def get_object(self):
        return self.request.user

    def form_valid(self, form):
        updated_email = form.cleaned_data['email']
        name = form.cleaned_data['full_name']
        slack = form.cleaned_data['slack']
        user = get_object_or_404(User, id=self.request.user.id)
        if updated_email and updated_email != user.email:
            base_url = reverse('users:confirm_password')
            query_string = urlencode({
                'updated_email': updated_email,
                'name': name,
                'slack': slack
            })
            return redirect('{}?{}'.format(base_url, query_string))
        return super(AccountView, self).form_valid(form)

    def get_success_url(self,):
        return reverse_lazy('users:account')

    def get_context_data(self, **kwargs):
        if self.request.user.is_superuser:
            swappable_form = BecomeUserForm()
        else:
            swappable_form = None

        show_change_password = password_management_enabled() and self.request.user.has_usable_password(),

        return super().get_context_data(
            swappable_form=swappable_form,
            show_change_password=show_change_password,
            **kwargs,
        )


class PasswordConfirmView(FormView):
    form_class = PasswordForm
    template_name = 'users/confirm_password.html'
    success_url = reverse_lazy('users:account')
    title = _('Enter Password')

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        kwargs['email'] = self.request.GET.get('updated_email')
        kwargs['name'] = self.request.GET.get('name')
        kwargs['slack'] = self.request.GET.get('slack')
        return kwargs
    
    def form_valid(self, form):
        form.save()  # Update the email and other details
        return super(PasswordConfirmView, self).form_valid(form)


@login_required()
def become(request):
    if not request.user.is_apply_staff:
        raise PermissionDenied()

    id = request.POST.get('user')
    if request.POST and id:
        target_user = User.objects.get(pk=id)
        if target_user.is_superuser:
            raise PermissionDenied()

        return login_with_id(request, id)
    return redirect('users:account')


@login_required()
@require_oauth_whitelist
def oauth(request):
    """Generic, empty view for the OAuth associations."""

    return TemplateResponse(request, 'users/oauth.html', {})


class ActivationView(TemplateView):
    def get(self, request, *args, **kwargs):
        user = self.get_user(kwargs.get('uidb64'))

        if self.valid(user, kwargs.get('token')):
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)
            return redirect('users:activate_password')

        return render(request, 'users/activation/invalid.html')

    def valid(self, user, token):
        """
        Verify that the activation token is valid and within the
        permitted activation time window.
        """

        token_generator = PasswordResetTokenGenerator()
        return user is not None and token_generator.check_token(user, token)

    def get_user(self, uidb64):
        """
        Given the verified uid, look up and return the
        corresponding user account if it exists, or ``None`` if it
        doesn't.
        """
        try:
            user = User.objects.get(**{
                'pk': force_str(urlsafe_base64_decode(uidb64))
            })
            return user
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return None


def create_password(request):
    """
    A custom view for the admin password change form used for account activation.
    """

    if request.method == 'POST':
        form = AdminPasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Important!
            messages.success(request, 'Your password was successfully updated!')
            return redirect('users:account')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = AdminPasswordChangeForm(request.user)
    return render(request, 'users/change_password.html', {
        'form': form
    })
