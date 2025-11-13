import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CheckCircle, CircleDashed } from 'lucide-react';
import { fetchOnboardingProgress, updateOnboardingProgress, createOnboardingProgress } from '../features/authorOnboardingSlice';
import toast from 'react-hot-toast';

// Define all possible onboarding steps statically on the frontend
const ALL_ONBOARDING_STEPS = [
  { id: 'step_1', title: 'Complete Profile', description: 'Fill in all your personal and professional details.' },
  { id: 'step_2', title: 'Understand Royalties', description: 'Read through the royalty agreements and payment schedules.' },
  { id: 'step_3', title: 'Submit Manuscript', description: 'Upload your first book manuscript for review.' },
  { id: 'step_4', title: 'Review Publishing Process', description: 'Familiarize yourself with our publishing stages.' },
  { id: 'step_5', title: 'Marketing Strategy Session', description: 'Schedule a call with our marketing team.' },
];

const AuthorOnboarding = () => {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { onboarding, status: onboardingStatus, error: onboardingError } = useSelector((state) => state.authorOnboarding);
  
  // Using a dummy userId for now. Replace with actual user ID from Clerk later.
  const userId = 'user_1'; 

  useEffect(() => {
    if (userId && currentWorkspace?.id) {
      dispatch(fetchOnboardingProgress(userId))
        .unwrap()
        .catch((err) => {
          if (err.message === 'Author onboarding record not found') { // Check the exact error message from backend
            dispatch(createOnboardingProgress({ userId, workspaceId: currentWorkspace.id }));
          } else {
            toast.error(`Failed to load onboarding: ${err.message}`);
          }
        });
    }
  }, [dispatch, userId, currentWorkspace?.id]);

  const stepsCompletedIds = onboarding?.steps_completed || [];
  const totalSteps = ALL_ONBOARDING_STEPS.length;
  const completedStepsCount = stepsCompletedIds.length;
  const progress = totalSteps > 0 ? (completedStepsCount / totalSteps) * 100 : 0;

  const toggleStepCompletion = async (stepId) => {
    let newStepsCompletedIds;
    if (stepsCompletedIds.includes(stepId)) {
      newStepsCompletedIds = stepsCompletedIds.filter(id => id !== stepId);
    } else {
      newStepsCompletedIds = [...stepsCompletedIds, stepId];
    }

    const newProgressPercent = totalSteps > 0 ? (newStepsCompletedIds.length / totalSteps) * 100 : 0;

    toast.loading("Updating progress...");
    try {
      await dispatch(updateOnboardingProgress({
        userId,
        stepsCompleted: newStepsCompletedIds,
        progressPercent: newProgressPercent,
      })).unwrap();
      toast.dismiss();
      toast.success("Onboarding progress updated!");
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to update progress: ${error.message || error}`);
      console.error("Failed to update onboarding progress:", error);
    }
  };

  if (onboardingStatus === 'loading' || !currentWorkspace || !onboarding) {
    return <div className="p-6 text-center text-gray-500 dark:text-zinc-400">Loading author onboarding...</div>;
  }

  if (onboardingStatus === 'failed') {
    return <div className="p-6 text-center text-red-500">Error: {onboardingError}</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Author Onboarding</h1>
      <p className="text-gray-500 dark:text-zinc-400 text-sm">Guided checklist for new authors to get started with the platform.</p>

      {/* Onboarding Progress */}
      <div className="rounded-lg border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Progress</h2>
        <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2.5 mb-4">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{completedStepsCount} of {totalSteps} steps completed ({progress.toFixed(0)}%)</p>
      </div>

      {/* Onboarding Checklist */}
      <div className="rounded-lg border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Onboarding Checklist</h2>
        <div className="space-y-4">
          {ALL_ONBOARDING_STEPS.map((step) => (
            <div key={step.id} className="flex items-start gap-3">
              <button onClick={() => toggleStepCompletion(step.id)} className="flex-shrink-0 p-1 rounded-full border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {stepsCompletedIds.includes(step.id) ? (
                  <CheckCircle className="size-5 text-emerald-500" />
                ) : (
                  <CircleDashed className="size-5 text-gray-400 dark:text-zinc-500" />
                )}
              </button>
              <div>
                <p className={`font-medium ${stepsCompletedIds.includes(step.id) ? 'text-gray-500 dark:text-zinc-500 line-through' : 'text-gray-900 dark:text-white'}`}>{step.title}</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthorOnboarding;
