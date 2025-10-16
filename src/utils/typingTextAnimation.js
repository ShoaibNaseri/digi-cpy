export function typingTextAnimation(text, duration) {
  const span = document.createElement("span");

  let index = 0;
  const totalChars = text.length;
  const interval = duration / totalChars;

  const intervalId = setInterval(() => {
    span.textContent += text.charAt(index);
    index++;
    if (index >= totalChars) {
      clearInterval(intervalId);
    }
  }, interval);

  return span;
}

export default typingTextAnimation;
