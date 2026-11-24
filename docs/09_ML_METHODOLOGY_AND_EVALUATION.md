# 09. Machine Learning Methodology & Evaluation

## 1. Design Philosophy: Explainable AI (XAI)
In an academic major project, opaque deep neural networks often suffer from black-box unpredictability and lack clear explainability during a viva examination. CivicLens employs **Explainable AI (XAI)** based on transparent statistical text representations (TF-IDF), linear classification models (Logistic Regression / Multinomial Naive Bayes), and spherical geometry (Haversine formula).

---

## 2. Feature 1: Issue Classification Pipeline

### TF-IDF Vectorization
The text description is converted into a high-dimensional feature vector using Term Frequency-Inverse Document Frequency:

$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \log\left(\frac{1 + |D|}{1 + |\{d' \in D : t \in d'\}|}\right) + 1$$

- **N-gram Range:** $(1, 2)$ — captures unigrams ("pothole", "leakage") and bigrams ("live wire", "open manhole", "water logging").
- **Sublinear TF Scaling:** Replaces raw term frequency $tf$ with $1 + \log(tf)$ to prevent repetitive words from dominating.
- **Stop Words:** English standard lexicon filtered out.

### Classifier Architecture
- **Model:** Multinomial Logistic Regression ($C=5.0$, `solver='lbfgs'`) with probability calibration.
- **Classes:** 6 distinct municipal categories:
  1. `Potholes & Damaged Roads`
  2. `Garbage Accumulation & Sanitation`
  3. `Blocked Drainage & Waterlogging`
  4. `Broken Streetlights & Electrical`
  5. `Water Leakage & Pipeline Issues`
  6. `Damaged Footpaths & Public Infrastructure`
- **Output:** Category with highest calibrated probability $P(\text{class} \mid \text{text})$, confidence score (0.00 to 1.00), and automated department suggestion.

### Evaluation Metrics
- **Dataset Size:** 120 curated municipal complaint samples across all 6 classes.
- **Train/Test Split:** 85% train, 15% stratified test.
- **Model Test Accuracy:** $\mathbf{72.22\%}$ on unseen test samples; $\mathbf{100\%}$ coverage with fallback heuristics.
- **Weighted F1-Score:** $\mathbf{69.68\%}$.

---

## 3. Feature 2: Dual-Factor Duplicate Detection

### Textual Similarity
The new complaint description is compared with candidates within the radial envelope using **Cosine Similarity**:

$$\text{Similarity}(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\|_2 \|\mathbf{B}\|_2}$$

### Geographical Distance (Haversine Formula)
To measure true spherical distance on the Earth's surface between $[\text{lng}_1, \text{lat}_1]$ and $[\text{lng}_2, \text{lat}_2]$:

$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)$$
$$c = 2 \cdot \text{atan2}(\sqrt{a}, \sqrt{1-a})$$
$$d = R \cdot c \quad (\text{where } R = 6,371,000 \text{ meters})$$

### Decision Rules
- **Immediate Spot Proximity:** $d \le 150\text{m}$ AND $\text{Similarity} \ge 0.15 \longrightarrow \text{Duplicate Flagged}$.
- **Local Vicinity:** $d \le 500\text{m}$ AND $\text{Similarity} \ge 0.35 \longrightarrow \text{Duplicate Flagged}$.
- **Neighborhood Zone:** $d \le 1200\text{m}$ AND $\text{Similarity} \ge 0.60 \longrightarrow \text{Duplicate Flagged}$.
- **Verbatim Duplicate:** $\text{Similarity} \ge 0.75 \longrightarrow \text{Duplicate Flagged}$ (independent of GPS precision error).

---

## 4. Feature 3: Transparent Multi-Factor Priority Scoring

Priority is calculated using a transparent linear scoring function $\text{Score} \in [10, 100]$:

$$\text{Score} = \text{Base} (50) + S_{\text{hazard}} + S_{\text{cat}} + S_{\text{volume}} + S_{\text{aging}}$$

Where:
- $S_{\text{hazard}} = +35$ if emergency safety terms (e.g. *accident*, *live wire*, *open manhole*, *hospital*, *school*, *collapse*) are detected.
- $S_{\text{cat}} = +12$ for high-risk physical infrastructure categories (Electrical, Waterlogging, Deep Potholes).
- $S_{\text{volume}} = \min(25, (\text{reports} - 1) \times 10)$ for clustered citizen reports.
- $S_{\text{aging}} = \min(20, \text{days\_pending} \times 3)$ for SLA violations.

**Tiers:**
- $\text{Score} \ge 70 \longrightarrow \mathbf{High}$ Priority (Immediate dispatch).
- $42 \le \text{Score} < 70 \longrightarrow \mathbf{Medium}$ Priority (Standard SLA).
- $\text{Score} < 42 \longrightarrow \mathbf{Low}$ Priority (Routine maintenance).
