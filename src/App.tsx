/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect } from "react";

function App() {

  async function loadScript(url: string, id: string, type: string) {
    return new Promise((resolve) => {
      document.body.appendChild(
        Object.assign(document.createElement("script"), {
          type: type,
          async: true,
          defer: true,
          id: id,
          src: url,
          onload: resolve,
        })
      );
    });
  }

  useEffect(() => {
    const container = document.getElementById('container');
    if (!container) {
      console.error('Container element not found');
      return;
    }

    loadScript('https://id-webcomponent-dev-factory.s3.amazonaws.com/demo/demo.esm.js', "genie-component", "module")
      .then(() => {
        container.insertAdjacentHTML('afterbegin',
          `<genie-component-general 
              url="${'https://EnrollDev.idfactory.me/verify?SubCustomer=WithHtmltest&key=d8ceca0e84354ab1a6918e34e456b29c24022025105255048'}"
              token="${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkJlYXJlciJ9.eyJuYW1laWQiOiI0OSIsIm5iZiI6MTc0MDQzNjg3OSwiZXhwIjoxNzQwNDQwNDc5LCJpYXQiOjE3NDA0MzY4NzksImlzcyI6Imh0dHBzOi8vZGV2LmlkZmFjdG9yeS5tZSIsImF1ZCI6Imh0dHBzOi8vZGV2LmlkZmFjdG9yeS5tZSJ9.4lxxWOuC1CZoAtYWwT59fN1aG5yeAuONEaK77QIup48'}">
            </genie-component-general>
          `);
      });
  }, []);

  useEffect(() => {
    const handleGenieEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log("detail response => ", customEvent.detail);
    };
  
    document.addEventListener("genieEventGeneral", handleGenieEvent);

    return () => {
      document.removeEventListener("genieEventGeneral", handleGenieEvent);
    };
  }, []);

  return (
    <div id="container" />
  );
}

export default App;
