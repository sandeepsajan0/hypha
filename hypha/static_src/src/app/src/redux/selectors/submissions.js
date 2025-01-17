import {createSelector} from 'reselect';

import {
    getCurrentRoundSubmissionIDs
} from '@selectors/rounds';

import {
    getSubmissionIDsForCurrentStatuses
} from '@selectors/statuses';

import {SelectSelectedFilters} from '@containers/SubmissionFilters/selectors';


const getSubmissions = state => state.submissions.byID;

const getCurrentSubmissionID = state => state.submissions.current;

const getReviewButtonStatus = state => state.submissions.showReviewForm;

const getCurrentReview = state => state.submissions.currentReview;

const getReviewDraftStatus = state => state.submissions.isReviewDraftExist;

const getDeterminationButtonStatus = state => state.submissions.showDeterminationForm;

const getCurrentDetermination = state => state.submissions.currentDetermination;

const getDeterminationDraftStatus = state => state.submissions.isDeterminationDraftExist;

const getSubmissionsForListing = state => Object.values(state.submissions.byID);

const getSubmissionFilters = state => SelectSelectedFilters(state);

const getSummaryEditorStatus = state => state.submissions.isSummaryEditorOpened;

const getGroupedIconStatus = state => state.submissions.showGroupedIcon;


const getCurrentRoundSubmissions = createSelector(
    [getCurrentRoundSubmissionIDs, getSubmissions],
    (submissionIDs, submissions) => {
        if (!Object.keys(submissions).length) {
            return [];
        }
        return submissionIDs.map(submissionID => submissions[submissionID]);
    }
);

const getCurrentStatusesSubmissions = createSelector(
    [getSubmissionIDsForCurrentStatuses, getSubmissions],
    (submissionIDs, submissions) => {
        if (!Object.keys(submissions).length) {
            return [];
        }
        return submissionIDs.map(submissionID => submissions[submissionID]);
    }
);

const getCurrentSubmission = createSelector(
    [getCurrentSubmissionID, getSubmissions],
    (id, submissions) => {
        return submissions[id];
    }
);

const getScreeningStatuses = createSelector(getCurrentSubmission, submission => {
    return submission && submission.screening && submission.screening.allScreening || [];
});

const getSubmissionScreening = createSelector(getCurrentSubmission, submission => {
    return submission && submission.screening || {};
});

const getSubmissionReminders = createSelector(getCurrentSubmission, submission => {
    return submission && submission.reminders || [];
});

const getSubmissionMetaTerms = createSelector(
    [getCurrentSubmission], submission => {
        let metaTerms = [];
        if (submission && 'metaTerms' in submission) {
            submission.metaTerms.map(metaTerm => {
                const existingMetaTermIndex = metaTerms.findIndex(mt => mt.parentId == metaTerm.parent.id);
                if (existingMetaTermIndex != -1) {
                    metaTerms[existingMetaTermIndex].children.push({id: metaTerm.id, name: metaTerm.name});
                }
                else {
                    metaTerms.push({
                        parentId: metaTerm.parent.id,
                        parent: metaTerm.parent.name,
                        children: [{id: metaTerm.id, name: metaTerm.name}]
                    });
                }
            });
        }
        return metaTerms;
    }
);

const getSubmissionOfID = (submissionID) => createSelector(
    [getSubmissions], submissions => submissions[submissionID]
);

const getSubmissionLoadingState = state => state.submissions.itemLoading === true;

const getSubmissionErrorState = state => state.submissions.itemLoadingError === true;

const getSubmissionsByRoundError = state => state.rounds.error;

const getSubmissionsByRoundLoadingState = state => state.submissions.itemsLoading === true;

export {
    getSubmissions,
    getSubmissionsForListing,
    getCurrentRoundSubmissions,
    getCurrentSubmission,
    getCurrentSubmissionID,
    getReviewButtonStatus,
    getCurrentReview,
    getReviewDraftStatus,
    getDeterminationButtonStatus,
    getCurrentDetermination,
    getDeterminationDraftStatus,
    getSubmissionsByRoundError,
    getSubmissionsByRoundLoadingState,
    getSubmissionLoadingState,
    getSubmissionErrorState,
    getSubmissionOfID,
    getCurrentStatusesSubmissions,
    getSubmissionFilters,
    getSummaryEditorStatus,
    getGroupedIconStatus,
    getScreeningStatuses,
    getSubmissionScreening,
    getSubmissionReminders,
    getSubmissionMetaTerms
};
