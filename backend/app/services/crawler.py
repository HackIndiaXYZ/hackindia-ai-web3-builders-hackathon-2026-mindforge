import re
from urllib.parse import urlparse, urljoin
from typing import Dict, Any, List, Set
import httpx
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AgentForgeCrawler/1.0"
}

def clean_html(html_content: str) -> Dict[str, Any]:
    """Clean HTML and extract title and normalized readable text."""
    soup = BeautifulSoup(html_content, "html.parser")

    # Extract title
    title = soup.title.string.strip() if soup.title and soup.title.string else "Untitled Page"

    # Remove script, style, nav, footer elements
    for element in soup(["script", "style", "noscript", "svg"]):
        element.extract()

    # Extract structured text preserving headers
    content_parts = []
    for tag in soup.find_all(["h1", "h2", "h3", "h4", "p", "li", "td", "th"]):
        text = tag.get_text(separator=" ", strip=True)
        if text and len(text) > 5:
            if tag.name.startswith("h"):
                content_parts.append(f"\n### {text}\n")
            else:
                content_parts.append(text)

    full_text = "\n".join(content_parts)
    # Normalize multiple whitespace / newlines
    full_text = re.sub(r"\n{3,}", "\n\n", full_text).strip()

    # Extract internal links
    links: Set[str] = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("http") or href.startswith("/"):
            links.add(href)

    return {
        "title": title,
        "content": full_text,
        "links": list(links)
    }

async def fetch_page(url: str, timeout: float = 15.0) -> Dict[str, Any]:
    """Asynchronously fetch a single web page and extract clean text."""
    try:
        async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True, timeout=timeout) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            cleaned = clean_html(resp.text)
            cleaned["url"] = str(resp.url)
            return cleaned
    except Exception as e:
        return {
            "title": "Error Fetching Page",
            "content": "",
            "links": [],
            "url": url,
            "error": str(e)
        }

async def verify_website_url(url: str, timeout: float = 7.0) -> Dict[str, Any]:
    """
    Verifies whether a given URL is a real, accessible, live website.
    Checks syntax, DNS resolution, and HTTP connectivity.
    """
    clean_url = url.strip()
    if not clean_url.startswith("http://") and not clean_url.startswith("https://"):
        clean_url = "https://" + clean_url
    
    parsed = urlparse(clean_url)
    if not parsed.netloc or "." not in parsed.netloc:
        return {
            "is_real": False,
            "status_code": 0,
            "error": "Invalid website URL or missing domain name.",
            "url": clean_url
        }

    try:
        async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True, timeout=timeout) as client:
            resp = await client.get(clean_url)
            is_real = resp.status_code < 400 or resp.status_code in [401, 403]
            title = ""
            if resp.status_code < 400 and resp.text:
                soup = BeautifulSoup(resp.text[:5000], "html.parser")
                title = soup.title.string.strip() if soup.title and soup.title.string else ""
            
            return {
                "is_real": is_real,
                "status_code": resp.status_code,
                "url": str(resp.url),
                "title": title or parsed.netloc,
                "error": "" if is_real else f"Website returned error status {resp.status_code}"
            }
    except httpx.ConnectError:
        return {
            "is_real": False,
            "status_code": 0,
            "error": f"Cannot connect to '{parsed.netloc}'. The domain does not exist or server is offline.",
            "url": clean_url
        }
    except httpx.TimeoutException:
        return {
            "is_real": False,
            "status_code": 0,
            "error": f"Connection to '{parsed.netloc}' timed out. Website is unresponsive.",
            "url": clean_url
        }
    except Exception as e:
        return {
            "is_real": False,
            "status_code": 0,
            "error": str(e),
            "url": clean_url
        }

async def crawl_website(base_url: str, max_pages: int = 5) -> List[Dict[str, Any]]:
    """Crawl the homepage and up to max_pages internal pages on the same host."""
    parsed_base = urlparse(base_url)
    base_host = parsed_base.netloc
    
    visited: Set[str] = set()
    to_visit: List[str] = [base_url]
    results: List[Dict[str, Any]] = []

    while to_visit and len(results) < max_pages:
        current_url = to_visit.pop(0)
        # Normalize URL
        if current_url in visited or "#" in current_url:
            continue
        visited.add(current_url)

        page_data = await fetch_page(current_url)
        if page_data.get("content"):
            results.append(page_data)
            # Find more links on same domain
            for link in page_data.get("links", []):
                full_url = urljoin(current_url, link)
                parsed_link = urlparse(full_url)
                if parsed_link.netloc == base_host and full_url not in visited:
                    # Ignore common static assets or media
                    if not any(full_url.lower().endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".pdf", ".zip", ".css", ".js"]):
                        to_visit.append(full_url)

    return results
