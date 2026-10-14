export type RelationshipType =
  | '연애·썸'
  | '소개팅·애프터'
  | '전연인·재회'
  | '직장·업무'
  | '친구·지인'
  | '가족·친척'
  | '중고거래·협상'
  | '일상·기타';

export interface ReplyOption {
  title: string;
  content: string;
  color: 'purple' | 'blue' | 'slate';
}

export interface ParticipantAnalysis {
  name: string;
  roleOrStance: string; // e.g. "주동/제안자", "신중/눈치형", "적극 호응자"
  subtext: string;      // 해당 인물의 속마음/의도
}

export interface DecodeReport {
  id: string;
  timestamp: string;
  relationshipContext: RelationshipType;
  chatType?: '1:1' | 'group'; // 1:1 또는 단톡방/그룹
  groupAtmosphere?: string;    // 단톡방 전체 분위기 요약
  participants?: ParticipantAnalysis[]; // 참여자별 분석
  mbti?: string;
  imagePreview?: string;
  imageName?: string;
  isDecodeFailed?: boolean;
  failureReason?: string;
  apology?: string;
  affectionScore: number;
  affectionLevel: string;
  tags: string[];
  interpretation: string;
  replies: {
    charm: ReplyOption;
    standard: ReplyOption;
    polite: ReplyOption;
  };
  warning: string;
}
