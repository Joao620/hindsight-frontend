import { useEffect, useState } from "react";

function LoadingScreen() {
  const messages = [
    "While loading, prioritize your tasks. Focus on the most important ones first.",
    "Loading... Meanwhile, consider breaking down large tasks into smaller, manageable chunks.",
    "Your board is loading. Take a moment to think about your project goals and how to achieve them incrementally.",
    "Loading in progress... Remember to keep your tasks concise and actionable.",
    "Getting your board ready... Think about how you can simplify complex tasks and make them more efficient.",
    "Loading... Use this time to reflect on your workflow and identify areas for improvement.",
    "Your data is loading. Consider creating a 'Definition of Done' to ensure clarity on task completion.",
    "While we load, ponder the power of iterative development and continuous improvement.",
    "Loading... Take a deep breath and think about how you can apply the principles of agility to your work.",
    "Getting everything ready... Remember to review and adjust your project scope regularly to ensure you're on track.",
  ];

  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 3000); // Troca a mensagem a cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-lime-600 text-white">
      <h2 className="text-xl font-semibold">Loading your board...</h2>
      <p className="mt-2 text-center text-sm">{message}</p>
    </div>
  );
}

export default LoadingScreen;
