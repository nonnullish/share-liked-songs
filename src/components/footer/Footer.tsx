import { Link } from "react-router-dom";
import "./footer.css";

export const Footer = () => {
  return (
    <footer>
      <Link to="/">Share Liked Songs</Link> · {BUILD_DATE} · <Link to="/faq">Info & Help</Link>
    </footer>
  );
};

