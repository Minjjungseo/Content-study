import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.study.count();
  if (existing > 0) {
    console.log("Demo data already present, skipping seed.");
    return;
  }

  const study1 = await prisma.study.create({
    data: {
      title: "콘텐츠 첫 3초에서 시청 이유를 보여준다",
      studyType: "LEARNED",
      sourceName: "릴스 강의",
      account: "COMMON",
      importance: "HIGH",
      tags: "hook,3초",
      keyContent: "첫 3초 안에 시청자가 계속 볼 이유를 명확히 보여줘야 이탈을 막을 수 있다.",
      applicableElements: "Hook,Structure",
      oneThing: "첫 장면에서 결과를 먼저 보여준다.",
      learnedWhat: "첫 3초 안에 시청 이유를 보여줘야 한다는 것",
      learnedWhy: "3초 안에 이탈하면 이후 콘텐츠는 아무도 보지 않기 때문",
      learnedWhere: "제품 리뷰, Ask 시리즈 등 결론이 있는 모든 콘텐츠",
    },
  });

  const study2 = await prisma.study.create({
    data: {
      title: "I love being a mum reference",
      studyType: "REFERENCE",
      sourceName: "Instagram Reels",
      account: "HEYELIA",
      importance: "MEDIUM",
      tags: "hook,mum",
      keyContent: "타깃이 마음속으로만 생각하던 문장을 그대로 후킹 문장으로 사용한 레퍼런스",
      applicableElements: "Hook,Positioning",
      oneThing: "타깃이 속으로 생각하지만 말하지 않는 문장을 Hook으로 사용한다.",
      refHook: "I love being a mum. I just don't want mum to be the only version of me.",
      refPromise: "엄마이면서도 나 자신을 잃지 않을 수 있다는 약속",
      refStructure: "속마음 고백 → 공감 → 전환의 순간",
      refEmotion: "안도감, 공감",
      refVisual: "얼굴 클로즈업 없이 담담한 보이스오버",
      refPayoff: "나도 그렇게 될 수 있다는 확신",
      refWhyItWorks: "타깃이 말하지 못했던 속마음을 대신 말해줘서 즉각적인 공감을 일으킨다.",
    },
  });

  const idea1 = await prisma.idea.create({
    data: {
      title: "Beauty Device — Yes or Pass?",
      account: "HEYELIA",
      contentIP: "Ask a Korean Shopping Host",
      myPriority: "P1",
      status: "EDITING",
      sourceStudyId: study1.id,
      oneThing: study1.oneThing,
      coreMessage: "쇼호스트 출신이 뷰티 디바이스, 사야 할지 말지 결론부터 알려준다.",
    },
  });

  const idea2 = await prisma.idea.create({
    data: {
      title: "I love being a mum. I just don't want mum to be the only version of me.",
      account: "HEYELIA",
      contentIP: "Becoming Me Again",
      myPriority: "P1",
      status: "IDEA",
      sourceStudyId: study2.id,
      oneThing: study2.oneThing,
    },
  });

  await prisma.studyIdeaLink.create({ data: { studyId: study1.id, ideaId: idea1.id } });
  await prisma.studyIdeaLink.create({ data: { studyId: study2.id, ideaId: idea2.id } });

  await prisma.experiment.create({
    data: {
      ideaId: idea1.id,
      oneThingToTest: "첫 장면에서 결론을 먼저 보여준다.",
      hypothesis: "첫 장면에서 결론을 먼저 보여주면 3초 유지율이 높아질 것이다.",
      hook: "이 디바이스, 사야 할까요 말아야 할까요? 결론부터 말씀드릴게요.",
      coreMessage: "쇼호스트의 눈으로 본 솔직한 Yes or Pass",
      structureSteps: "1. 결론 먼저 공개\n2. 이유 3가지\n3. 실제 사용 장면\n4. 최종 정리",
      cta: "저장해두고 결정할 때 다시 보세요",
      status: "EDITING",
    },
  });

  await prisma.playbookRule.create({
    data: {
      title: "제품 설명보다 먼저 '언제 필요한 제품인지'를 보여준다.",
      category: "STRUCTURE",
      description: "스펙 나열보다 '이런 상황이면 필요하다'는 장면을 먼저 보여줘야 시청자가 자신의 이야기로 받아들인다.",
      appliedAccounts: "HEYELIA",
      appliedContentIP: "Ask a Korean Shopping Host",
      status: "CANDIDATE",
    },
  });

  console.log("Seed complete:", { study1: study1.id, study2: study2.id, idea1: idea1.id, idea2: idea2.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
