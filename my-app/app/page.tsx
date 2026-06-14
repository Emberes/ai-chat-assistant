import Image from "next/image";
import generated_jocky from "../public/generated_jocky.png";

export default function Home() {
  return (
    <main className="homePage">
      <div className="homePage_container">
        <header className="homePage_header">
          <p className="homePage_title">Välkommen till TravHjälpen!</p>
          <p className="homePage_subtitle">Din AI-drivna travexpert för snabba svar gällande dagens eller helgens trav.</p>
        </header>

        <div className="homePage_content">
          <Image src={generated_jocky} alt="Animated horse" className="homePage_image"/>
          <div className="homePage_text">
          <h2>Vad kan TravHjälpen hjälpa dig med?</h2>
          <ul>
            <li><strong>Snabba svar:</strong> Få omedelbara svar på dina travfrågor, oavsett om det gäller hästar, lopp eller tips.</li>
            <li><strong>Expertis:</strong> TravHjälpen är tränad på omfattande data om travsporten, men tänk på att TravHjälpen kan ha fel!</li>
          </ul>

          <p>Klicka på knappen nedan för att börja chatta med TravHjälpen och få svar på dina travfrågor!</p>
          </div>

          <a href="/chat" className="homePage_chatBtn">
            Chatta med TravHjälpen här!
          </a>

        </div>
        <div className="homePage_divider">
        <footer className="homePage_footer">
          <p>Observera att TravHjälpen är en AI-modell och kan ge felaktiga svar. Detta är ett projekt som kommer att utvecklas mer i framtiden.</p>
        </footer>
        </div>
      </div>
        </main>
  );
}
