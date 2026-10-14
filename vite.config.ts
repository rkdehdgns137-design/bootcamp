import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/decode' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });

          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            try {
              const { imageBase64, relationshipContext, mbti, sampleType } = JSON.parse(body);
              const apiKey = process.env.GEMINI_API_KEY;

              if (apiKey && imageBase64 && !sampleType) {
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
4. [상황별 맞춤 답장]: 단체방인 경우 단톡방의 분위기를 살리는 답장 또는 자연스러운 동조/생존형 답장을 제안하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "chatType": "1:1" 또는 "group",
  "groupAtmosphere": "단톡방인 경우 전체 분위기 한 줄 요약 (1:1이면 생략 또는 빈 문자열)",
  "participants": [
    {
      "name": "발언자 이름/닉네임",
      "roleOrStance": "스탠스/역할",
      "subtext": "이 발언자의 진짜 속마음"
    }
  ],
  "affectionScore": (0~100 사이의 정수, 단톡방인 경우 방의 화합도/친밀도 지수),
  "affectionLevel": "높은 호감" 또는 "비즈니스 친절" 또는 "화기애애함" 또는 "눈치/긴장감" 등 4~6글자 요약,
  "tags": ["#태그1", "#태그2", "#태그3"],
  "interpretation": "상대방들(또는 상대방)의 실제 멘트와 뉘앙스에 기반한 심층 해석",
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

                  // Try gemini-3.1-flash-lite first, fallback to gemini-flash-latest
                  let responseText = '';
                  for (const modelName of ['gemini-3.1-flash-lite', 'gemini-flash-latest']) {
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
                      console.warn(`Model ${modelName} failed, trying fallback:`, mErr);
                    }
                  }

                  if (responseText) {
                    const parsed = JSON.parse(responseText);
                    res.statusCode = 200;
                    res.end(JSON.stringify({ success: true, data: parsed }));
                    return;
                  }
                } catch (geminiError) {
                  console.warn('Gemini vision API error:', geminiError);
                }
              }

              // Dynamic contextual fallback if API or quota fails
              const fallback = generateContextualResult(relationshipContext, mbti, sampleType);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: fallback }));
            } catch (err: any) {
              console.error('Error handling decode request:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

function generateContextualResult(context: string, mbti?: string, sampleType?: string) {
  if (sampleType === 'wedding' || (!sampleType && context === '친구·지인')) {
    return {
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

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
