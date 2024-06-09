import { renderHook } from '@testing-library/react';

import { MessageRole, TranscriptMessageType } from '../../../lib/conversation.type';

import { ChatMessage, useChatMessages } from './useChatMessages';

jest.mock('uuid', () => {
  let value = 0;
  return {
    v4() {
      value++;
      return value.toString();
    },
  };
});

describe('useChatMessages', () => {
  it('should return an empty array if transcripts is undefined', () => {
    const { result } = renderHook(() => useChatMessages({ transcripts: undefined }));

    expect(result.current).toEqual([]);
  });

  it('should join consecutive transcripts done by the same user role', () => {
    const { result } = renderHook(() => useChatMessages({
      transcripts: [
        {
          role: MessageRole.ASSISTANT,
          timestamp: '2024-06-05T14:30:00.00-03:00',
          transcript: 'Hi.',
          transcriptType: TranscriptMessageType.FINAL,
        },
        {
          role: MessageRole.ASSISTANT,
          timestamp: '2024-06-05T14:30:00.00-03:00',
          transcript: 'I\'m Devin.',
          transcriptType: TranscriptMessageType.FINAL,
        },
        {
          role: MessageRole.USER,
          timestamp: '2024-06-05T14:35:00.00-03:00',
          transcript: 'Hey.',
          transcriptType: TranscriptMessageType.FINAL,
        },
        {
          role: MessageRole.USER,
          timestamp: '2024-06-05T14:36:00.00-03:00',
          transcript: 'I\'m doing great. Thanks for asking.',
          transcriptType: TranscriptMessageType.FINAL,
        },
        {
          role: MessageRole.ASSISTANT,
          timestamp: '2024-06-05T14:36:03.00-03:00',
          transcript: '![exercise](/cognitive-exercise-sample.png)',
          transcriptType: TranscriptMessageType.FINAL,
        },
        {
          role: MessageRole.ASSISTANT,
          timestamp: '2024-06-05T14:40:00.00-03:00',
          transcript: 'How is everything going?',
          transcriptType: TranscriptMessageType.FINAL,
        },
      ],
    }));

    expect(result.current).toEqual([
      {
        id: '1',
        role: MessageRole.ASSISTANT,
        timestamp: '2024-06-05T14:30:00.00-03:00',
        content: 'Hi. I\'m Devin.',
      },
      {
        id: '2',
        role: MessageRole.USER,
        timestamp: '2024-06-05T14:35:00.00-03:00',
        content: 'Hey. I\'m doing great. Thanks for asking.',
      },
      {
        id: '3',
        role: MessageRole.ASSISTANT,
        timestamp: '2024-06-05T14:36:03.00-03:00',
        content: '![exercise](/cognitive-exercise-sample.png)',
      },
      {
        id: '4',
        role: MessageRole.ASSISTANT,
        timestamp: '2024-06-05T14:40:00.00-03:00',
        content: 'How is everything going?',
      },
    ] satisfies ChatMessage[]);
  });
});
