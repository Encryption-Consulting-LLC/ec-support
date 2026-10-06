import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ROUTES } from "../../lib/router/path";

// Submits to /kb/search?q=..., so every search has a shareable URL.
export default function SearchBox({ initial = "" }) {
  const navigate = useNavigate();
  const [q, setQ] = useState(initial);

  const submit = (e) => {
    e.preventDefault(); // stop the browser's full-page form submit
    navigate(`${ROUTES.KB_SEARCH}?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form role="search" className="p-inputgroup kb-search" onSubmit={submit}>
      <InputText
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search articles, runbooks and FAQs"
        aria-label="Search the knowledge base"
      />
      <Button type="submit" icon="pi pi-search" label="Search" />
    </form>
  );
}
