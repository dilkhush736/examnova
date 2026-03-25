import { useEffect } from "react";

function upsertMeta(selector, attributes) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    document.head.appendChild(tag);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      tag.setAttribute(key, value);
    }
  });
}

function upsertLink(selector, attributes) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("link");
    document.head.appendChild(tag);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      tag.setAttribute(key, value);
    }
  });
}

function upsertJsonLd(id, schema) {
  if (!schema) {
    return;
  }

  let tag = document.head.querySelector(`script[data-seo-jsonld="${id}"]`);
  if (!tag) {
    tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.dataset.seoJsonld = id;
    document.head.appendChild(tag);
  }

  tag.textContent = JSON.stringify(schema);
}

export function SeoHead({
  title,
  description,
  canonical,
  openGraph = {},
  twitter = {},
  robots = "index,follow",
  jsonLd = null,
}) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description || "",
    });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: robots,
    });
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: openGraph.title || title || "",
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: openGraph.description || description || "",
    });
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: openGraph.type || "website",
    });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: openGraph.url || canonical || window.location.href,
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: openGraph.image || "",
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: twitter.card || "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: twitter.title || title || "",
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: twitter.description || description || "",
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: twitter.image || openGraph.image || "",
    });

    if (canonical) {
      upsertLink('link[rel="canonical"]', {
        rel: "canonical",
        href: canonical,
      });
    }

    if (jsonLd) {
      if (Array.isArray(jsonLd)) {
        jsonLd.forEach((schema, index) => upsertJsonLd(`schema-${index}`, schema));
      } else {
        upsertJsonLd("schema-0", jsonLd);
      }
    }
  }, [canonical, description, jsonLd, openGraph, robots, title, twitter]);

  return null;
}
