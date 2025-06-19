import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import QuestionsAnimation from "../Animation/QuestionsAnimation"; // ← import animation

const faqs = [
  {
    question: "What is a Visual Workflow Builder?",
    answer: "It’s a drag-and-drop tool that lets you create, visualize, and manage workflows with connected nodes, without writing code.",
  },
  {
    question: "Is it built for developers or non-developers?",
    answer: "Both. Developers can extend it using custom Python nodes, and non-developers can visually build workflows without code.",
  },
  {
    question: "Can I use AI or LLMs inside workflows?",
    answer: "Yes. We support LLM integrations like OpenAI and others to power text generation, summarization, or automation steps.",
  },
  {
    question: "Is it open-source?",
    answer: "Yes, the core of the builder is open-source and customizable. You can fork and adapt it for your use case.",
  },
];

const Questions = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative flex flex-col items-center gap-10 py-20 px-4 bg-white text-black overflow-hidden w-full">

      <QuestionsAnimation className="absolute top-0 left-0 w-64 h-64 animate-fade-in-slow" />

      <h2 className="text-4xl font-bold text-orange-500 z-10">Questions</h2>

      <div className="w-full max-w-6xl space-y-4 z-10">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={clsx(
                "transition-all duration-300 ease-in-out border border-gray-200 rounded-xl overflow-hidden shadow-md",
                {
                  "bg-orange-50 border-orange-300 scale-[1.01]": isOpen,
                  "bg-white": !isOpen,
                }
              )}
            >
              <button
                onClick={() => toggle(i)}
                className="flex justify-between items-center w-full p-5 text-left"
              >
                <span className="font-semibold text-lg text-black">{faq.question}</span>
                <ChevronDown
                  className={clsx(
                    "w-5 h-5 text-orange-600 transform transition-transform duration-300",
                    {
                      "rotate-180": isOpen,
                    }
                  )}
                />
              </button>
              <div
                className={clsx(
                  "px-5 overflow-hidden transition-all duration-300 text-gray-700",
                  {
                    "max-h-[500px] pb-4": isOpen,
                    "max-h-0": !isOpen,
                  }
                )}
              >
                <p className="text-base">{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>

  );
};

export default Questions;
