# Digits PDF figures

These PNGs are the original embedded images extracted with `pypdf.PdfReader(...).pages[n].images[0].data` from `docs/KNNKMEANSFINALPAPER.pdf`. No chart data or image content was regenerated, restyled, or inferred.

| File | Source PDF page (1-based) | Figure | Original dimensions |
| --- | --- | --- | --- |
| `digits-figure-1.png` | 6 | MNIST Database | 557 × 327 |
| `digits-figure-2.png` | 8 | Approximate Image Set Zero | 1007 × 914 |
| `digits-figure-3.png` | 10 | Confusion Matrix for Classification Model Performance | 856 × 894 |

Captions are rendered from `docs/digits-paper.txt` in their original positions. Figure 1's original source attribution remains in the caption. Full-size image links support closer inspection on mobile.

The two French PDFs (`papers/Le Bourgeois gentilhomme.pdf`, 9 pages, and `papers/La ville intelligent.pdf`, 12 pages) contain no embedded image objects. They are rendered from their complete text sources without invented figures.

Re-extraction (development only; `pypdf` is not a site dependency):

```python
from pathlib import Path
from pypdf import PdfReader
reader = PdfReader("docs/KNNKMEANSFINALPAPER.pdf")
for number, page in enumerate([5, 7, 9], 1):
    Path(f"assets/paper-figures/digits-figure-{number}.png").write_bytes(
        reader.pages[page].images[0].data
    )
```
