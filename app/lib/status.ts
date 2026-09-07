import { Prisma } from "@prisma/client";

export const studyWithProgressInclude = {
  studyIdeaLinks: {
    include: {
      idea: {
        include: {
          experiments: {
            include: {
              review: true,
              publishedContents: true,
              playbookEvidence: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.StudyInclude;

export type StudyWithProgress = Prisma.StudyGetPayload<{
  include: typeof studyWithProgressInclude;
}>;

export const LIBRARY_STATUSES = [
  "SAVED",
  "ANALYZED",
  "ONE_THING",
  "APPLIED",
  "PUBLISHED",
  "REVIEWED",
  "PLAYBOOK",
] as const;
export type LibraryStatus = (typeof LIBRARY_STATUSES)[number];

export const LIBRARY_STATUS_LABEL: Record<LibraryStatus, string> = {
  SAVED: "Saved",
  ANALYZED: "Analyzed",
  ONE_THING: "ONE THING",
  APPLIED: "Applied",
  PUBLISHED: "Published",
  REVIEWED: "Reviewed",
  PLAYBOOK: "Playbook",
};

export function computeStudyStatus(study: StudyWithProgress): LibraryStatus {
  let status: LibraryStatus = "SAVED";

  if (study.keyContent || study.applicableElements) status = "ANALYZED";
  if (study.oneThing) status = "ONE_THING";

  const experiments = study.studyIdeaLinks.flatMap((l) => l.idea.experiments);
  if (study.studyIdeaLinks.length > 0) status = "APPLIED";
  if (experiments.some((e) => e.publishedContents.length > 0)) status = "PUBLISHED";
  if (experiments.some((e) => e.review)) status = "REVIEWED";
  if (experiments.some((e) => e.playbookEvidence.length > 0)) status = "PLAYBOOK";

  return status;
}
