import { useEffect, useState } from "react";
import { fetchFeed } from "../fetchRSS";
import { FaRegCalendarAlt, FaShareAlt } from "react-icons/fa";

export default function Artikler() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const POSTS_PER_PAGE = 6;

  useEffect(() => {
    const load = async () => {
      try {
        const items = await fetchFeed();
        setPosts(items);
      } catch (err) {
        console.error("Feil ved lasting av artikler:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const allCategories = [
    "Alle",
    ...new Set(posts.flatMap((post) => post.categories || [])),
  ];

  const filteredPosts = posts.filter((post) => {
    const inCategory =
      selectedCategory === "Alle" || post.categories?.includes(selectedCategory);
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.contentSnippet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.fullContent?.toLowerCase().includes(searchTerm.toLowerCase());
    return inCategory && matchesSearch;
  });

  const pageCount = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const pagePosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url: post.link,
        });
      } catch (err) {
        console.error("Deling avbrutt:", err);
      }
    } else {
      navigator.clipboard.writeText(post.link);
      alert("Lenke kopiert til utklippstavlen!");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Nyeste artikler</h1>
      <p className="text-sm text-gray-600 mb-4">
        Artikler, andakter og undervisning.
      </p>

      <input
        type="text"
        placeholder="Søk i artikler..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border rounded px-3 py-2 text-sm w-full mb-4"
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-sm border ${
              selectedCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Laster artikler…</p>
      ) : pagePosts.length === 0 ? (
        <p>Ingen artikler funnet.</p>
      ) : (
        pagePosts.map((post, i) => (
          <div
            key={i}
            className="mb-6 border-b pb-4 hover:bg-gray-50 transition rounded-md p-2 flex items-start gap-4"
          >
            {post.image && (
              <img
                src={post.image}
                alt=""
                className="w-28 h-28 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold hover:underline block"
              >
                {post.title}
              </a>
              <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <FaRegCalendarAlt />
                {new Date(post.pubDate).toLocaleDateString("nb-NO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <p className="mt-2 text-sm text-gray-700">{post.contentSnippet}...</p>

              <button
                onClick={() => handleShare(post)}
                className="mt-2 inline-flex items-center gap-1 text-blue-600 text-sm hover:underline"
              >
                <FaShareAlt /> Del
              </button>
            </div>
          </div>
        ))
      )}

      {pageCount > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border text-sm"
          >
            Forrige
          </button>
          <span className="text-sm px-2 py-1">
            Side {currentPage} av {pageCount}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
            disabled={currentPage === pageCount}
            className="px-3 py-1 rounded border text-sm"
          >
            Neste
          </button>
        </div>
      )}
    </div>
  );
}
