import { isBrowser } from 'react-device-detect';
import { Avatar, Button, Select, SelectItem, Spinner } from '@nextui-org/react';
import React from 'react';

import { useDeepgram, voices } from '../context/Deepgram'; // Ensure the path matches where your context is defined
import { llmModels } from '../context/LLM';
import { promptData } from '../context/PromptList'; // Update the import path as needed

interface ConversationSelectOptionsProps {
  value?: string;
  onChange?(value: string): void;
}

interface NumberSelectOptionsProps {
  value?: number;
  onChange?(value: number): void;
}

const LLMModelSelection = ({ value, onChange }: ConversationSelectOptionsProps) => {
  const llmModelOptions = Object.entries(llmModels).map(([key, value]) => ({
    id: key,
    label: `${value.llmProvider} - ${value.llmModel}`,
    api: value.api,
  }));

  return (
    <Select
      value={value}
      selectedKeys={[value]}
      onChange={(e) => onChange(e.target.value)}
      label="Select LLM Model"
      variant="bordered"
    >
      {llmModelOptions.map((option) => (
        <SelectItem key={option.id} value={option.id}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
};

const PromptSelection = ({ value, onChange }: ConversationSelectOptionsProps) => {
  const promptOptions = Object.entries(promptData).map(([key, value]) => ({
    id: key,
    label: value.title,
    description: value.description,
  }));

  return (
    <Select
      value={value}
      selectedKeys={[value]}
      onChange={(e) => onChange(e.target.value)}
      label="Select a Conversation"
      variant="bordered"
    >
      {promptOptions.map((option) => (
        <SelectItem key={option.id} value={option.id} textValue={option.label}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
};

const VoiceAssistantSelect = ({ value, onChange }: ConversationSelectOptionsProps) => {
  const options = Object.entries(voices).map(([key, obj]) => ({
    id: key,
    ...obj,
  }));

  return (
    <Select
      items={options}
      variant="bordered"
      onChange={(e) => onChange?.(e.target.value)}
      label="Select a Voice Assistant"
      placeholder="Select a user"
      selectedKeys={[value]}
    >
      {(option) => (
        <SelectItem key={option.id} value={option.id} textValue={option.name}>
          <div className="flex gap-2 items-center">
            <Avatar alt={option.name} className="flex-shrink-0" size="sm" src={option.avatar} />
            <div className="flex flex-col">
              <span className="text-small">{option.name}</span>
              <span className="text-tiny text-default-400">{option.ttsProvider}</span>
            </div>
          </div>
        </SelectItem>
      )}
    </Select>
  );
};

const UtteranceEndMsSelection = ({ value, onChange }: NumberSelectOptionsProps) => {
  const utteranceEndMsOptions = [
    1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000, 3250, 3500, 3750, 4000,
  ];

  return (
    <Select
      value={value?.toString()}
      selectedKeys={[value?.toString()]}
      onChange={(e) => onChange(Number(e.target.value))}
      label="Select STT Delay (ms)"
      variant="bordered"
    >
      {utteranceEndMsOptions.map((option) => (
        <SelectItem key={option.toString()} value={option.toString()} textValue={option.toString()}>
          {option} ms
        </SelectItem>
      ))}
    </Select>
  );
};

interface InitialLoadProps {
  onSubmit: () => void;
  connecting: boolean;
}

export const InitialLoad = ({ onSubmit, connecting }: InitialLoadProps) => {
  const { state, dispatch } = useDeepgram();

  const {
    llm,
    selectedPrompt: { id: selectedPrompt },
    ttsOptions: { model: voiceModel },
    sttOptions: { utterance_end_ms: utteranceEndMsInput } = { utterance_end_ms: 0 }, // Default value if undefined
  } = state;

  // TODO: refactor context state so we can use llmModel directly
  const llmModel = Object.keys(llmModels).find((k) => llmModels[k].llmModel === llm.llmModel);

  const disableButton = connecting || !llmModel || !selectedPrompt || !voiceModel || isNaN(utteranceEndMsInput);

  return (
    <>
      <div className="col-start-1 col-end-13 sm:col-start-2 sm:col-end-12 md:col-start-3 md:col-end-11 lg:col-start-4 lg:col-end-10 p-3 mb-1/2">
        <div className="relative block w-full glass p-6 sm:p-8 lg:p-12 rounded-xl">
          <h2 className="font-favorit mt-2 block font-bold text-xl text-gray-100 text-center">
            Welcome to ExtraYear&apos;s
            <br />
            Cognitive Rehab Tech Demo
          </h2>
          <div className="flex justify-center mt-4">
            <p className="text-center text-default-400">Conversations for Cognitive Health</p>
          </div>
          <div className="mt-6">
            <div className="my-2.5">
              <LLMModelSelection
                value={llmModel}
                onChange={(value) => {
                  dispatch({
                    type: 'SET_LLM',
                    payload: value,
                  });
                }}
              />
            </div>
            <div className="my-2.5">
              <PromptSelection
                value={selectedPrompt}
                onChange={(value) => {
                  dispatch({
                    type: 'SET_PROMPT',
                    payload: value, // Make sure this variable holds the prompt ID or relevant identifier
                  });
                }}
              />
            </div>
            <div className="my-2.5">
              <VoiceAssistantSelect
                value={voiceModel}
                onChange={(value) => {
                  dispatch({
                    type: 'SET_TTS_OPTIONS',
                    payload: {
                      model: value,
                      provider: voices[value].ttsProvider,
                    },
                  });
                }}
              />
            </div>
            <div className="my-2.5">
              <UtteranceEndMsSelection
                value={utteranceEndMsInput}
                onChange={(value) => {
                  dispatch({
                    type: 'SET_UTTERANCE_END_MS',
                    payload: value,
                  });
                }}
              />
            </div>

            <Button
              className="mt-4 disabled"
              color="primary"
              isDisabled={disableButton}
              fullWidth
              isLoading={connecting}
              onClick={onSubmit}
              size="lg"
              startContent={connecting && (
                <Spinner size="sm" />
              )}
            >
              {connecting ? 'Connecting...' : `${isBrowser ? 'Click' : 'Tap'} here to start`}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
