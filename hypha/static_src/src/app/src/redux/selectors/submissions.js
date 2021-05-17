import { createSelector } from 'reselect';

import {
    getCurrentRoundSubmissionIDs,
} from '@selectors/rounds';

import {
    getSubmissionIDsForCurrentStatuses,
} from '@selectors/statuses';

import { SelectSelectedFilters } from '@containers/SubmissionFilters/selectors'


const getSubmissions = state => state.submissions.byID;

const getCurrentSubmissionID = state => state.submissions.current;

const getReviewButtonStatus = state => state.submissions.showReviewForm;

const getCurrentReview = state => state.submissions.currentReview;

const getReviewDraftStatus = state => state.submissions.isReviewDraftExist;

const getDeterminationButtonStatus = state => state.submissions.showDeterminationForm;

const getCurrentDetermination = state => state.submissions.currentDetermination;

const getDeterminationDraftStatus = state => state.submissions.isDeterminationDraftExist;

const getSubmissionsForListing = state => Object.values(state.submissions.byID)

const getSubmissionFilters = state => SelectSelectedFilters(state)

const getSummaryEditorStatus = state => state.submissions.isSummaryEditorOpened;

const getGroupedIconStatus = state => state.submissions.showGroupedIcon

const getCurrentRoundSubmissions = createSelector(
    [ getCurrentRoundSubmissionIDs, getSubmissions],
    (submissionIDs, submissions) => {
        if(!Object.keys(submissions).length) {
            return []
        }
        return submissionIDs.map(submissionID => submissions[submissionID]);
    }
);

const getCurrentStatusesSubmissions = createSelector(
    [ getSubmissionIDsForCurrentStatuses, getSubmissions],
    (submissionIDs, submissions) => {
        if(!Object.keys(submissions).length) {
            return []
        }
        return submissionIDs.map(submissionID => submissions[submissionID]);
    }
);

const getCurrentSubmission = createSelector(
    [ getCurrentSubmissionID, getSubmissions ],
    (id, submissions) => {
        return submissions[id];
    }
);

const getSubmissionMetaTerms = createSelector(
    [getCurrentSubmission], submission => {
        if(submission && "metaTerms" in submission){
            let metaTerms = []
            submission.metaTerms.map(metaTerm => {
                if(metaTerms.find(mt => mt.parentId == metaTerm.parentId)){
                    const index = metaTerms.indexOf(metaTerms.find(mt => mt.parentId == metaTerm.parentId))
                    metaTerms[index].children.push({'id': metaTerm.id, 'name': metaTerm.name})
                }
                else {
                    metaTerms.push({
                        parentId : metaTerm.parentId,
                        parent: metaTerm.parent,
                        children: [{'id': metaTerm.id, 'name': metaTerm.name}]
                    })
                }
            })
            return metaTerms
        }
        return []
    }
)

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
    getSubmissionMetaTerms
};
