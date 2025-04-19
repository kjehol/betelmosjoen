import { useEffect, useState } from "react";
import { fetchFeed } from "../fetchRSS";

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const items = await fetchFeed();
      setPosts(items);
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Nyeste artikler</h1>
      {posts.length === 0 && <p>Ingen innlegg funnet.</p>}
      {posts.map((post, i) => (
        <div key={i} className="mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold">{post.title}</h2>
          <p className="text-sm text-gray-500">
            {new Date(post.pubDate).toLocaleDateString()}
          </p>
          <p className="mt-2">{post.contentSnippet}</p>
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Les mer
          </a>
        </div>
      ))}
    </div>
  );
}
