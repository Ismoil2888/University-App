import React, { useEffect } from "react";

const FlowXOWidget = () => {
  useEffect(() => {
    // Создаем элемент <script>
    const script = document.createElement("script");
    script.src = "https://widget.flowxo.com/embed.js";
    script.async = true;
    script.defer = true;
    script.setAttribute(
      "data-fxo-widget",
      JSON.stringify({
        theme: "#2aa863",
        web: {
          botId: "673735bf610b3600520e1fec",
          theme: "#2aa863",
          label: "T I K - Чат",
        },
        welcomeText: "Привет! Чем мы можем вам помочь?",
      })
    );

    // Добавляем скрипт в DOM
    document.body.appendChild(script);

    // Удаляем скрипт при размонтировании компонента
    return () => {
      document.body.removeChild(script);
    };
  }, []); // Пустой массив зависимостей: эффект выполнится только при монтировании и размонтировании

  return null; // Компонент не отображает ничего, только добавляет скрипт
};

export default FlowXOWidget;