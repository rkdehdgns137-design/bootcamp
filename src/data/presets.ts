import { DecodeReport, RelationshipType } from '../types';

export interface PresetSample {
  id: string;
  name: string;
  context: RelationshipType;
  mbti?: string;
  chatSnippet: string;
  report: DecodeReport;
}

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'wedding',
    name: '결혼식 축하 인사 (예시 화면)',
    context: '친구·지인',
    mbti: 'ESFJ',
    chatSnippet: '형님 오늘 결혼식 와주셔서 진짜 너무 감사합니데이!!',
    report: {
      id: 'wedding-report-1',
      timestamp: '방금 전',
      relationshipContext: '친구·지인',
      mbti: 'ESFJ',
      imageName: '결혼식_축하_카톡.png',
      affectionScore: 88,
      affectionLevel: '높은 호감',
      tags: ['#진심어린고마움', '#끈끈한의리', '#훈훈한마무리'],
      interpretation:
        '결혼식에 와준 것만으로도 정말 크게 고마워하고 있으며, 격의 없는 사투리 말투로 깊은 친밀감과 유대감을 표현하고 있습니다. 벅찬 결혼식 일정을 치르는 와중에도 감사함을 잊지 않고 진심을 다해 화답한 상태입니다.',
      replies: {
        charm: {
          title: '호감 자극형',
          content: '신행 재미있게 잘 다녀오고! 나중에 형이랑 소주 한잔 제대로 하자 브라더 ㅎㅎ',
          color: 'purple',
        },
        standard: {
          title: '무난·표준형',
          content: '응응 둘이 신혼여행 조심히 잘 다녀와~ 다녀와서 얼굴 한번 보자!',
          color: 'blue',
        },
        polite: {
          title: '정중한 마무리형',
          content: '그래 신행 잘 다녀와라! 화이팅! 🤙',
          color: 'slate',
        },
      },
      warning:
        '신혼여행 준비와 주변 인사로 정신없이 바쁜 시기이니, 더 이상 답장을 재촉하거나 대화를 길게 이어가지 말고 깔끔하게 마침표를 찍어주는 것이 배려입니다.',
    },
  },
  {
    id: 'romance',
    name: '데이트 후 썸톡',
    context: '연애·썸',
    mbti: 'ENFP',
    chatSnippet: '오늘 진짜 시간 가는 줄 몰랐어 ㅎㅎ 조심히 들어가!',
    report: {
      id: 'romance-report-1',
      timestamp: '방금 전',
      relationshipContext: '연애·썸',
      mbti: 'ENFP',
      imageName: '썸_데이트후_카톡.png',
      affectionScore: 92,
      affectionLevel: '매우 높은 호감',
      tags: ['#설렘가득', '#다음만남기대', '#호감신호포착'],
      interpretation:
        '데이트가 끝난 직후 먼저 귀가 안부와 감상을 남긴 것은 상대방에게 강한 호감과 애착이 형성되었음을 뜻합니다. 웃음 표현(ㅎㅎ)과 감정 공유는 관계를 다음 단계로 진전시키고자 하는 명백한 긍정 신호입니다.',
      replies: {
        charm: {
          title: '호감 자극형',
          content: '나도 오늘 하루 종일 웃느라 턱 아팠어 ㅋㅋ 얼른 푹 쉬구 내일 또 톡하자!',
          color: 'purple',
        },
        standard: {
          title: '무난·표준형',
          content: '응응 나도 오늘 너무 즐거웠어~ 조심히 들어가서 편하게 쉬어!',
          color: 'blue',
        },
        polite: {
          title: '정중한 마무리형',
          content: '오늘 고생 많았어! 푹 쉬고 좋은 밤 보내~',
          color: 'slate',
        },
      },
      warning:
        '상대방이 푹 쉬라는 뉘앙스를 보일 때는 늦은 밤까지 무리하게 대화를 이어가기보다 여운을 남기며 마무리하는 것이 호감도를 더 높입니다.',
    },
  },
  {
    id: 'group',
    name: '팀 단톡방 회식 일정 (다수 대화)',
    context: '직장·업무',
    mbti: 'ESTJ',
    chatSnippet: '박팀장: 이번 주 금요일 회식 어떠세요? / 이대리: 넵 가능합니다! / 최사원: 저도 괜찮습니다',
    report: {
      id: 'group-report-1',
      timestamp: '방금 전',
      relationshipContext: '직장·업무',
      chatType: 'group',
      groupAtmosphere: '서로 눈치를 살피며 팀장 제안에 원만하게 동조하는 비즈니스 분위기',
      participants: [
        {
          name: '박팀장',
          roleOrStance: '주동·제안자',
          subtext: '팀원들의 자발적 참여를 유도하려 하나, 사실상 확정을 기대하고 있는 뉘앙스입니다.',
        },
        {
          name: '이대리',
          roleOrStance: '적극 호응자',
          subtext: '팀장의 제안에 가장 먼저 동조하여 회식 분위기를 부드럽게 이끌려는 의도입니다.',
        },
        {
          name: '최사원',
          roleOrStance: '동조·눈치형',
          subtext: '선배들의 반응을 살핀 후 자연스럽게 합류 의사를 표시한 상태입니다.',
        },
      ],
      mbti: 'ESTJ',
      imageName: '팀_단톡방_캡처.png',
      affectionScore: 78,
      affectionLevel: '화기애애함',
      tags: ['#단톡방조율', '#상호눈치', '#원만한동조'],
      interpretation:
        '단톡방 내에서 상급자의 제안에 구성원들이 차례대로 동조하며 일정이 긍정적으로 좁혀지고 있습니다. 튀지 않고 자연스럽게 일정을 맞추거나 센스 있는 장소 추천을 덧붙이면 단톡방 내 호감도가 급상승합니다.',
      replies: {
        charm: {
          title: '호감 자극형 (분위기 주도)',
          content: '저도 금요일 좋습니다 팀장님! 혹시 이번에 가고 싶으신 메뉴나 장소 있으실까요?',
          color: 'purple',
        },
        standard: {
          title: '무난·표준형 (자연스러운 동조)',
          content: '저도 금요일 일정 가능합니다! 다들 그날 뵙겠습니다 ㅎㅎ',
          color: 'blue',
        },
        polite: {
          title: '정중한 마무리형 (신속 확인)',
          content: '네 저도 금요일 참석 가능합니다. 확인 감사합니다!',
          color: 'slate',
        },
      },
      warning:
        '단톡방에서는 답변 텀이 너무 길어지면 분위기를 흐릴 수 있으니, 참석 여부만이라도 빠르게 남겨주는 것이 최선입니다.',
    },
  },
  {
    id: 'work',
    name: '직장 상사 업무 피드백',
    context: '직장·업무',
    mbti: 'ESTJ',
    chatSnippet: '네 수정안 확인했습니다. 내일 회의 전까지 출력해두세요.',
    report: {
      id: 'work-report-1',
      timestamp: '방금 전',
      relationshipContext: '직장·업무',
      mbti: 'ESTJ',
      imageName: '업무_메신저_캡처.png',
      affectionScore: 70,
      affectionLevel: '비즈니스 신뢰',
      tags: ['#업무효율우선', '#신속한승인', '#격식준수'],
      interpretation:
        '감정 표현 없이 군더더기 없는 확인과 지시로 이루어져 있으나, 수정 사항에 대한 별도 지적이 없다는 점은 결과물에 만족하고 있음을 방증합니다. 명확한 수신 보고만으로도 높은 프로페셔널 점수를 얻을 수 있습니다.',
      replies: {
        charm: {
          title: '호감 자극형',
          content: '네 팀장님, 내일 회의 30분 전까지 회의실에 출력본 세팅 완료해 두겠습니다. 편안한 저녁 되십시오!',
          color: 'purple',
        },
        standard: {
          title: '무난·표준형',
          content: '네 확인 감사합니다. 내일 회의 시작 전 출력 준비해 두겠습니다.',
          color: 'blue',
        },
        polite: {
          title: '정중한 마무리형',
          content: '네 알겠습니다. 내일 아침 출력해 놓겠습니다. 수고하셨습니다!',
          color: 'slate',
        },
      },
      warning:
        '업무 확인 메시지에는 사족이나 이모티콘을 최소화하고, 실행 일정(언제까지 완료할지)을 명문화하여 답변하는 것이 가장 안전합니다.',
    },
  },
];

// Utility to create a simulated chat image for preview if user clicks preset
export function createPresetCanvasDataUrl(title: string, userText: string, otherText: string): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#b2c7d9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header bar
  ctx.fillStyle = '#9fb7cc';
  ctx.fillRect(0, 0, canvas.width, 48);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`‹  ${title}`, 16, 29);

  // Other chat bubble (White)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(16, 68, 300, 52, 10);
  ctx.fill();

  ctx.fillStyle = '#111827';
  ctx.font = '13px sans-serif';
  ctx.fillText(otherText, 28, 98);

  // My chat bubble (Yellow)
  ctx.fillStyle = '#fee500';
  ctx.beginPath();
  ctx.roundRect(84, 140, 300, 52, 10);
  ctx.fill();

  ctx.fillStyle = '#111827';
  ctx.font = '13px sans-serif';
  ctx.fillText(userText, 96, 170);

  return canvas.toDataURL('image/png');
}
