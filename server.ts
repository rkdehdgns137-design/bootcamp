import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Increase payload limit for screenshot base64 data
app.use(express.json({ limit: '25mb' }));

function generateContextualResult(context: string, mbti?: string) {
  if (context === '소개팅·애프터') {
    return {
      affectionScore: 86,
      affectionLevel: '확실한 그린라이트',
      tags: ['#애프터기대', '#대화코드일치', '#다음약속유도'],
      interpretation:
        '만남 직후 감사 인사와 함께 대화의 즐거움을 적극적으로 언급하고 있습니다. 귀가 안부를 챙기는 것은 상대방에게 확실한 호감이 있음을 나타내며, 대화의 여운을 이어가며 자연스럽게 두 번째 만남을 원하고 있습니다.',
      replies: {
        charm: {
          title: '호감 자극형',
          content: '오늘 시간 가는 줄 몰랐어요! 말씀하셨던 그 맛집 이번 주말에 같이 가보실래요? ㅎㅎ',
          color: 'purple',
        },
        standard: {
          title: '무난·표준형',
          content: '저도 오늘 너무 즐거웠어요~ 조심히 들어가시고 푹 쉬세요!',
          color: 'blue',
        },
        polite: {
          title: '정중한 마무리형',
          content: '오늘 배려해주셔서 감사했습니다. 편안한 밤 보내세요.',
          color: 'slate',
        },
      },
      warning:
        '상대방의 호감 신호에 너무 성급하게 장소를 확정하려 하기보다는, 음식이나 관심사 이야기를 나누며 부드럽게 일정을 좁혀가는 것이 성공률을 높입니다.',
    };
  }

  if (context === '전연인·재회') {
    return {
      affectionScore: 48,
      affectionLevel: '복합적 미련',
      tags: ['#경계심공존', '#후폭풍과망설임', '#떠보기가능성'],
      interpretation:
        '연락을 먼저 건넸지만 여전히 감정적인 방어벽과 경계심이 공존하고 있습니다. 안부를 묻는 멘트 속에는 여전한 미련과 궁금증이 담겨 있으나, 다시 상처받고 싶지 않은 조심스러움이 강하게 작용하고 있습니다.',
      replies: {
        charm: {
          title: '호감 자극형',
          content: '응 나 잘 지내고 있어. 갑자기 연락 와서 놀랐네 ㅎㅎ 너도 별일 없지?',
          color: 'purple',
        },
        standard: {
          title: '무난·표준형',
          content: '응 잘 지내. 너도 잘 지내고 있지?',
          color: 'blue',
        },
        polite: {
          title: '정중한 마무리형',
          content: '응 잘 지내고 있어. 신경 써줘서 고마워.',
          color: 'slate',
        },
      },
      warning:
        '상대방이 먼저 연락했다고 해서 갑자기 감정을 쏟아내거나 재회를 서두르면 상대방이 바로 도망갈 수 있습니다. 덤덤하고 여유로운 태도를 유지해야 합니다.',
    };
  }

  if (context === '가족·친척') {
    return {
      affectionScore: 90,
      affectionLevel: '숨은 깊은 애정',
      tags: ['#츤데레걱정', '#표현의서툼', '#밥은먹었니'],
      interpretation:
        '표현은 다소 투박하고 직설적이거나 잔소리처럼 들릴 수 있지만, 행간에는 깊은 걱정과 애정이 오롯이 담겨 있습니다. 겉으로 드러난 어미보다는 상대방이 챙겨주고자 하는 본질적인 안위와 건강에 주목해야 합니다.',
      replies: {
        charm: {
          title: '호감 자극형',
          content: '밥 잘 챙겨 먹고 있으니까 걱정 마요! 항상 챙겨줘서 고맙고 사랑해~ ㅎㅎ',
          color: 'purple',
        },
        standard: {
          title: '무난·표준형',
          content: '네 잘 챙겨 먹고 건강하게 지내고 있어요. 걱정 마세요!',
          color: 'blue',
        },
        polite: {
          title: '정중한 마무리형',
          content: '연락 주셔서 감사합니다. 말씀하신 부분 잘 챙길게요.',
          color: 'slate',
        },
      },
      warning:
        '잔소리에 감정적으로 맞받아치면 서운함이 커질 수 있습니다. 안부와 감사의 한마디를 먼저 건네면 분위기가 한결 따뜻해집니다.',
    };
  }

  if (context === '중고거래·협상') {
    return {
      affectionScore: 75,
      affectionLevel: '신뢰 매너 양호',
      tags: ['#쿨거래가능성', '#완곡한네고', '#빠른수락필요'],
      interpretation:
        '정중한 경어체와 명확한 거래 조건을 제시하여 거래 신뢰도가 높은 편입니다. 가격 조정(네고) 요청이 있더라도 예의를 갖추고 있으므로, 수용 가능한 범위를 명확히 밝히면 빠른 거래 성사가 가능합니다.',
      replies: {
        charm: {
          title: '호감 자극형',
          content: '매너 있게 문의해주셔서 감사합니다! 말씀하신 금액으로 조율해 드릴게요. 거래 편하신 시간대 말씀해주세요~',
          color: 'purple',
        },
        standard: {
          title: '무난·표준형',
          content: '네 말씀하신 조건으로 거래 가능합니다. 직거래는 어느 역 부근이 편하신가요?',
          color: 'blue',
        },
        polite: {
          title: '정중한 마무리형',
          content: '죄송하지만 해당 가격에는 어렵습니다. 기존 제시가로 진행 원하시면 말씀 부탁드립니다.',
          color: 'slate',
        },
      },
      warning:
        '답장 간격이 30분 이상 지체되면 상대방이 다른 판매자에게로 이탈할 수 있으니 수락 또는 거절 의사를 신속히 밝히는 것이 중요합니다.',
    };
  }

  if (context === '친구·지인') {
    return {
      affectionScore: 88,
      affectionLevel: '높은 호감',
      tags: ['#진심어린고마움', '#끈끈한의리', '#훈훈한마무리'],
      interpretation:
        '오랜 친분과 신뢰를 바탕으로 한 편안하고 격의 없는 유대감이 느껴집니다. 군더더기 없는 자연스러운 말투 속에 서로에 대한 호의와 든든한 지지가 담겨 있습니다.',
      replies: {
        charm: {
          title: '호감 자극형',
          content: '너밖에 없다 진짜 ㅋㅋ 조만간 맛있는 거 먹으러 가자 내가 쏠게!',
          color: 'purple',
        },
        standard: {
          title: '무난·표준형',
          content: '응응 고마워~ 시간 될 때 얼굴 한번 보자!',
          color: 'blue',
        },
        polite: {
          title: '정중한 마무리형',
          content: '그래 확인 고마워! 나중에 연락할게~',
          color: 'slate',
        },
      },
      warning:
        '친한 사이일수록 사소한 약속 시간이나 일정 조율을 가볍게 넘기지 않고 명확히 매듭짓는 것이 관계를 오래 유지하는 비결입니다.',
    };
  }

  if (context === '직장·업무') {
    return {
      affectionScore: 68,
      affectionLevel: '비즈니스 신뢰',
      tags: ['#업무효율중시', '#완곡한피드백', '#신속한답장'],
      interpretation:
        '간결하고 절제된 표현 속에 업무 진행 상황에 대한 만족감이 담겨 있습니다. 군더더기 없는 확인성 답변은 상대방의 업무 과중을 뜻하며, 추가적인 질문보다는 핵심 요약 공유를 원하고 있습니다.',
      replies: {
        charm: {
          title: '호감 자극형',
          content: '팀장님, 바쁘신 와중에 빠른 확인 감사드립니다! 검토하시기 편하도록 핵심 포인트만 별도 메모 남겨두었습니다.',
          color: 'purple',
        },
        standard: {
          title: '무난·표준형',
          content: '네 확인 감사합니다. 다음 피드백 주시면 바로 반영하여 보고드리겠습니다.',
          color: 'blue',
        },
        polite: {
          title: '정중한 마무리형',
          content: '확인 감사합니다! 좋은 하루 보내십시오.',
          color: 'slate',
        },
      },
      warning:
        '업무시간 외에는 불필요한 사담을 자제하고, 수신 확인 여부만 명확하고 깔끔하게 회신하는 것이 신뢰도를 높입니다.',
    };
  }

  if (context === '일상·기타') {
    return {
      affectionScore: 72,
      affectionLevel: '원만한 매너',
      tags: ['#상호존중', '#약속성사높음', '#안정된온도'],
      interpretation:
        '예의를 차리면서도 긍정적인 수락 의사를 나타내고 있습니다. 상대방이 일정 조율에 주도권을 넘겼으므로, 선택지를 2개 내외로 좁혀서 명확히 제안해주면 신뢰가 크게 향상됩니다.',
      replies: {
        charm: {
          title: '호감 자극형',
          content: '시간 배려해주셔서 감사해요! 이번 주 목요일이나 금요일 저녁 중 편하신 날 말씀해주시면 제가 맞춰볼게요 ㅎㅎ',
          color: 'purple',
        },
        standard: {
          title: '무난·표준형',
          content: '네 알겠습니다! 그럼 일정 확인해보시고 편하실 때 알려주세요~',
          color: 'blue',
        },
        polite: {
          title: '정중한 마무리형',
          content: '확인 감사합니다. 편한 일정 생기시면 언제든 연락 주세요!',
          color: 'slate',
        },
      },
      warning:
        '답변 선택지를 너무 많이 열어두면 상대방의 피로도가 높아지니, 구체적인 시간대 2개 정도를 제안하는 것이 최선입니다.',
    };
  }

  // Default: 연애·썸
  return {
    affectionScore: 82,
    affectionLevel: '은근한 호감',
    tags: ['#설렘지수상승', '#답장기대감', '#밀당보다는피로'],
    interpretation:
      '바쁜 일상 중에도 대화 흐름을 끊지 않으려는 명확한 의지가 보입니다. 이모지와 말끝 흐림(ㅎㅎ, ~)은 호감의 방증이며, 지금 조급해하지 않고 여유를 보여주면 상대방의 호감도가 극대화됩니다.',
    replies: {
      charm: {
        title: '호감 자극형',
        content: '오늘 진짜 고생 많았나 보네! 얼른 푹 쉬구 이따가 여유 생기면 편하게 톡해 ㅎㅎ',
        color: 'purple',
      },
      standard: {
        title: '무난·표준형',
        content: '오늘 일 바쁜가 보구나! 힘내구 시간 될 때 연락 줘~',
        color: 'blue',
      },
      polite: {
        title: '정중한 마무리형',
        content: '응응 일 잘 마무리하구 쉬어! 파이팅이야 👍',
        color: 'slate',
      },
    },
    warning:
      '상대방이 바쁘다고 할 때 연속으로 재촉 질문을 던지면 호감도가 급감할 수 있습니다. 여유롭고 배려 있는 태도가 결정타입니다.',
  };
}

// POST /api/decode
app.post('/api/decode', async (req, res) => {
  try {
    const { imageBase64, relationshipContext, mbti } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && imageBase64) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        // Detect exact MIME type
        const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,/i);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const base64Data = imageBase64.replace(/^data:[^;]+;base64,/i, '').trim();

        const prompt = `당신은 대화 심리 프로파일러 '톡해독' AI입니다.
제공된 이미지(카카오톡, 문자, 인스타그램 DM, 라인, 슬랙 등)에 찍힌 대화 내용 전체를 꼼꼼히 읽고 해석하세요.
관계 맥락: [${relationshipContext || '연애·썸'}]
${mbti ? `상대방 MBTI 성향: [${mbti}]` : ''}

[핵심 분석 가이드]
1. [대화 형태 판별]: 이미지 속 대화가 '1:1 대화'인지, 여러 명이 참여한 '단체톡/그룹방(3인 이상)'인지 먼저 판별하세요.
2. [다수 참여자 구분]:
   - 단체방인 경우 'chatType'을 "group"으로 지정하고, 대화창에 등장하는 서로 다른 발언자(프로필 닉네임)들을 구분하여 'participants' 배열에 각각 정리하세요.
   - 각 발언자별로 { "name": "닉네임/이름", "roleOrStance": "역할이나 태도(예: 분위기 주도형, 눈치/방관형, 수습/조율형)", "subtext": "이 사람이 한 발언의 숨겨진 속마음과 의도" }를 기재하세요.
   - 1:1 대화인 경우 'chatType'을 "1:1"로 하고 'participants'는 빈 배열 []로 두세요.
3. [행간 및 속마음]: 전체적인 대화 흐름, 어미, 이모티콘, 분위기 역학을 통찰력 있게 3~4문장으로 해석하세요.
4. [관계 맥락별 특화 진단]:
   - '연애·썸': 호감도, 밀당 여부, 질투, 설렘 신호 분석
   - '소개팅·애프터': 첫인상 호감도, 다음 만남(애프터) 성사 가능성, 그린라이트 vs 완곡한 거절 신호 분석
   - '전연인·재회': 먼저 연락한 진짜 의도(외로움, 미련, 죄책감, 떠보기), 후폭풍 및 재회 망설임 정도 분석
   - '직장·업무': 업무 효율, 상하관계 예의선, 결재/컨펌 뉘앙스 분석
   - '친구·지인': 친밀도, 유대감, 격의 없는 대화 코드 분석
   - '가족·친척': 겉으로 드러난 잔소리 뒤에 숨은 깊은 애정과 안위 걱정, 세대 차이 이해 분석
   - '중고거래·협상': 거래 신뢰도, 매너, 네고(가격 흥정) 진정성, 쿨거래 vs 잠수 파기 낌새 분석
   - '일상·기타': 상호 존중 및 원만한 매너 분석
5. [상황별 맞춤 답장]: 단체방인 경우 분위기를 살리는 답장 또는 동조형 답장, 1:1인 경우 관계 맥락에 가장 안전하고 효과적인 3가지 답장을 제안하세요.
6. [해독 실패 및 판독 불가 판별 (필수)]:
   - 만약 업로드된 이미지가 대화/메신저 스크린샷이 아니거나(예: 일반 풍경, 음식, 인물 셀카, 그래픽, 단색 배경, 영수증 등), 말풍선이나 대화 텍스트가 없어 분석할 수 없거나, 글씨가 심하게 깨지거나 흐릿하여 대화 내용을 읽을 수 없는 경우:
     "isDecodeFailed": true 로 지정하고,
     "failureReason": "판독할 수 없는 구체적인 사유를 1~2문장으로 친절하고 명확하게 기재 (예: 이미지에서 카카오톡/메신저 대화 말풍선이나 텍스트를 감지할 수 없습니다. 대화창이 아닌 일반 사진이거나 글씨가 너무 흐릿합니다.)",
     "apology": "대화 내용을 명확하게 판독해 드리지 못해 진심으로 죄송합니다. 대화 말풍선과 텍스트가 잘 보이는 스크린샷으로 다시 업로드해 주시면 꼼꼼하게 해독해 드리겠습니다."
   - 대화 내용이 정상적으로 식별되는 경우:
     "isDecodeFailed": false, "failureReason": "", "apology": ""

반드시 아래 JSON 형식으로만 응답하세요:
{
  "isDecodeFailed": true 또는 false,
  "failureReason": "해독 실패 시 구체적인 사유 (정상 시 빈 문자열)",
  "apology": "해독 실패 시 정중한 사과 메시지 (정상 시 빈 문자열)",
  "chatType": "1:1" 또는 "group",
  "groupAtmosphere": "단톡방인 경우 전체 분위기 한 줄 요약 (1:1이면 생략 또는 빈 문자열)",
  "participants": [
    {
      "name": "발언자 이름/닉네임",
      "roleOrStance": "스탠스/역할",
      "subtext": "이 발언자의 진짜 속마음"
    }
  ],
  "affectionScore": (0~100 사이의 정수, 단톡방인 경우 방의 화합도/친밀도 지수, 실패 시 0),
  "affectionLevel": "높은 호감" 또는 "비즈니스 친절" 또는 "화기애애함" 또는 "판독 불가" 등 4~6글자 요약,
  "tags": ["#태그1", "#태그2", "#태그3"],
  "interpretation": "상대방들(또는 상대방)의 실제 멘트와 뉘앙스에 기반한 심층 해석 (실패 시 빈 문자열)",
  "replies": {
    "charm": {
      "title": "호감 자극형",
      "content": "상대방의 호감을 유도하고 기분 좋게 만드는 답장 (단톡방이면 분위기 주도)",
      "color": "purple"
    },
    "standard": {
      "title": "무난·표준형",
      "content": "자연스럽고 예의를 지키는 표준 답장 (단톡방이면 무난한 동조)",
      "color": "blue"
    },
    "polite": {
      "title": "정중한 마무리형",
      "content": "깔끔하게 대화를 마무리하는 매너 답장",
      "color": "slate"
    }
  },
  "warning": "이 대화(또는 단톡방)에서 주의할 점이나 타이밍 팁 (1~2문장)"
}`;

        let responseText = '';
        const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
        for (const modelName of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: {
                parts: [
                  {
                    inlineData: {
                      mimeType,
                      data: base64Data,
                    },
                  },
                  { text: prompt },
                ],
              },
              config: {
                responseMimeType: 'application/json',
              },
            });
            if (response.text) {
              responseText = response.text;
              break;
            }
          } catch (mErr) {
            console.warn(`Model ${modelName} attempt failed:`, mErr);
          }
        }

        if (responseText) {
          const parsed = JSON.parse(responseText);
          if (parsed.isDecodeFailed) {
            if (!parsed.apology) {
              parsed.apology = '대화 내용을 온전히 해독해 드리지 못해 진심으로 사과드립니다.';
            }
            if (!parsed.failureReason) {
              parsed.failureReason = '이미지 내 대화 텍스트가 식별되지 않거나 해독하기 어려운 형식입니다.';
            }
          }
          res.json({ success: true, data: parsed });
          return;
        }

        // When image was provided but AI models could not complete parsing
        res.json({
          success: true,
          data: {
            isDecodeFailed: true,
            failureReason: 'AI 비전 분석 엔진과의 연결이 원활하지 않거나 이미지 텍스트 판독에 실패했습니다.',
            apology: '서비스 이용에 불편을 끼쳐드려 진심으로 죄송합니다. 잠시 후 다시 시도해 주시거나 다른 캡처 사진으로 진행해 주세요.',
            affectionScore: 0,
            affectionLevel: '판독 실패',
            tags: ['#판독실패', '#이미지확인필요', '#재시도권장'],
            interpretation: '대화 화면을 인식하지 못하여 행간 및 심리 분석을 진행할 수 없었습니다.',
            replies: {
              charm: { title: '호감 자극형', content: '선명한 캡처로 재시도 후 제공됩니다.', color: 'purple' },
              standard: { title: '무난·표준형', content: '선명한 캡처로 재시도 후 제공됩니다.', color: 'blue' },
              polite: { title: '정중한 마무리형', content: '선명한 캡처로 재시도 후 제공됩니다.', color: 'slate' },
            },
            warning: '대화 말풍선과 텍스트가 온전히 보이는 스크린샷으로 업로드해 주세요.'
          }
        });
        return;
      } catch (geminiError) {
        console.warn('Gemini vision API error:', geminiError);
        res.json({
          success: true,
          data: {
            isDecodeFailed: true,
            failureReason: '대화 캡처 분석 중 일시적인 서버 통신 지연 또는 API 오류가 발생했습니다.',
            apology: '서비스 이용에 불편을 끼쳐드려 진심으로 죄송합니다. 잠시 후 다시 시도해 주시기 바랍니다.',
            affectionScore: 0,
            affectionLevel: '통신 지연',
            tags: ['#통신오류', '#잠시후재시도'],
            interpretation: '서버 통신 지연으로 인해 대화 내용을 분석하지 못했습니다.',
            replies: {
              charm: { title: '호감 자극형', content: '잠시 후 다시 시도해 주세요.', color: 'purple' },
              standard: { title: '무난·표준형', content: '잠시 후 다시 시도해 주세요.', color: 'blue' },
              polite: { title: '정중한 마무리형', content: '잠시 후 다시 시도해 주세요.', color: 'slate' },
            },
            warning: '네트워크 연결 상태를 확인하시거나 잠시 후 다시 시도해 주세요.'
          }
        });
        return;
      }
    }

    // Dynamic contextual fallback
    const fallback = generateContextualResult(relationshipContext || '연애·썸', mbti);
    res.json({ success: true, data: fallback });
  } catch (err: any) {
    console.error('Error handling decode request:', err);
    res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });
}

startServer();
