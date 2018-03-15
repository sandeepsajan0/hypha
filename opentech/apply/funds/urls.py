from django.urls import path

from .views import SubmissionSearchView, SubmissionDetailView, SubmissionEditView, SubmissionListView, demo_workflow


app_name = 'funds'

urlpatterns = [
    path('demo/<int:wf_id>/', demo_workflow, name="workflow_demo"),
    path('submissions/', SubmissionListView.as_view(), name="submissions"),
    path('submissions/<int:pk>/', SubmissionDetailView.as_view(), name="submission"),
    path('submissions/<int:pk>/edit', SubmissionEditView.as_view(), name="edit_submission"),
    path('search', SubmissionSearchView.as_view(), name="search"),
]
