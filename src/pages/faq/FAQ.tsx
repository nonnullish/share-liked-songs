import Markdown from "react-markdown";
import { contents } from "./contents";

export const FAQ = () => {
  return (
    <article>
      <Markdown>{contents}</Markdown>
    </article>
  );
};
