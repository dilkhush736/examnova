import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { EmptyStateCard } from "../../components/ui/EmptyStateCard.jsx";
import { QuestionReviewCard } from "../../components/ui/QuestionReviewCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  detectQuestions,
  getDocument,
  listDetectedQuestions,
  resetDetectedQuestions,
  updateQuestionSelections,
} from "../../services/api/index.js";

function normalizeFilterValue(value) {
  return String(value || "").trim().toLowerCase();
}

export function QuestionDetectionPage() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [document, setDocument] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [search, setSearch] = useState("");
  const [questionType, setQuestionType] = useState("all");
  const [importanceFilter, setImportanceFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [documentResponse, questionsResponse] = await Promise.all([
          getDocument(accessToken, id),
          listDetectedQuestions(accessToken, id),
        ]);

        if (!active) {
          return;
        }

        setDocument(documentResponse.data.document);
        setQuestions(questionsResponse.data.questions);
        setPrompt(
          documentResponse.data.document?.detectionPrompt ||
            questionsResponse.data.document?.detectionPrompt ||
            "",
        );
      } catch (error) {
        if (active) {
          setFeedback({ type: "error", message: error.message || "Unable to load detection review data." });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (accessToken && id) {
      loadData();
    }

    return () => {
      active = false;
    };
  }, [accessToken, id]);

  const filteredQuestions = questions.filter((question) => {
    const questionText = String(question.questionText || "").toLowerCase();
    const normalizedQuestionType = normalizeFilterValue(question.inferredQuestionType);
    const normalizedImportance = normalizeFilterValue(question.importanceFlag);

    if (search && !questionText.includes(search.toLowerCase())) {
      return false;
    }
    if (questionType !== "all" && normalizedQuestionType !== questionType) {
      return false;
    }
    if (importanceFilter !== "all" && normalizedImportance !== importanceFilter) {
      return false;
    }
    return true;
  });

  const selectedCount = questions.filter((question) => question.selectedForGeneration).length;
  const hasDetectedQuestions = questions.length > 0;
  const hasVisibleQuestions = filteredQuestions.length > 0;

  function resetFilters() {
    setSearch("");
    setQuestionType("all");
    setImportanceFilter("all");
  }

  async function handleDetect(forceRerun = false) {
    setFeedback({ type: "", message: "" });
    setIsDetecting(true);

    try {
      const response = await detectQuestions(accessToken, id, {
        prompt,
        forceRerun,
      });
      setQuestions(response.data.questions);
      setFeedback({
        type: "success",
        message: response.data.questions.length
          ? "Questions detected successfully."
          : "Detection completed, but no strong question candidates were found.",
      });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Question detection failed." });
    } finally {
      setIsDetecting(false);
    }
  }

  async function handleToggle(question) {
    try {
      const response = await updateQuestionSelections(accessToken, id, {
        questionIds: [question.id],
        selected: !question.selectedForGeneration,
      });
      setQuestions(response.data.questions);
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to update selection." });
    }
  }

  async function handleBulkSelection(selected) {
    const ids = filteredQuestions.map((question) => question.id);
    if (!ids.length) {
      return;
    }

    try {
      const response = await updateQuestionSelections(accessToken, id, {
        questionIds: ids,
        selected,
      });
      setQuestions(response.data.questions);
      setFeedback({
        type: "success",
        message: selected ? "Filtered questions selected." : "Filtered questions deselected.",
      });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to update question selections." });
    }
  }

  async function handleReset() {
    try {
      await resetDetectedQuestions(accessToken, id);
      setQuestions([]);
      setFeedback({ type: "success", message: "Detected question set reset successfully." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to reset detection." });
    }
  }

  if (isLoading) {
    return <LoadingCard message="Loading question review workspace..." />;
  }

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Question detection"
        title={document?.documentTitle || document?.originalName || "Detected questions"}
        description="Use prompt-guided detection to isolate the exam questions that matter, then review and save your final selection."
        action={
          <StatusBadge tone={questions.length ? "success" : "neutral"}>
            {selectedCount} selected
          </StatusBadge>
        }
      />

      {feedback.message ? (
        <p className={feedback.type === "error" ? "form-error" : "form-success"}>{feedback.message}</p>
      ) : null}

      <div className="two-column-grid detection-grid">
        <form
          className="detail-card detection-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleDetect(true);
          }}
        >
          <SectionHeader
            eyebrow="Detection prompt"
            title="Guide the detector"
            description="Examples: important questions only, Unit 3, long questions, or subject-focused prompts."
          />
          <label className="field">
            <span>Prompt</span>
            <textarea
              className="input textarea"
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Generate only important long questions from Unit 3 related to operating systems."
              value={prompt}
            />
          </label>
          <div className="hero-actions">
            <button className="button primary" disabled={isDetecting} type="submit">
              {isDetecting ? "Detecting..." : "Run detection"}
            </button>
            <button className="button ghost" onClick={() => handleReset()} type="button">
              Reset detected set
            </button>
          </div>
        </form>

        <article className="detail-card">
          <SectionHeader
            eyebrow="Selection tools"
            title="Review controls"
            description="Search, filter, and save the exact set of questions you want to send into answer generation."
          />
          <div className="two-column-grid compact">
            <label className="field">
              <span>Search</span>
              <input
                className="input"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search detected questions"
                value={search}
              />
            </label>
            <label className="field">
              <span>Question type</span>
              <select className="input" onChange={(event) => setQuestionType(event.target.value)} value={questionType}>
                <option value="all">All</option>
                <option value="short">Short</option>
                <option value="long">Long</option>
                <option value="definition">Definition</option>
                <option value="problem">Problem</option>
                <option value="theory">Theory</option>
              </select>
            </label>
            <label className="field">
              <span>Importance</span>
              <select className="input" onChange={(event) => setImportanceFilter(event.target.value)} value={importanceFilter}>
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
              </select>
            </label>
          </div>
          <div className="hero-actions">
            <button className="button secondary" onClick={() => handleBulkSelection(true)} type="button">
              Select filtered
            </button>
            <button className="button ghost" onClick={() => handleBulkSelection(false)} type="button">
              Deselect filtered
            </button>
            <Link className="button ghost" to={`/app/documents/${id}/answers`}>
              Continue to answer generation
            </Link>
          </div>
        </article>
      </div>

      {hasVisibleQuestions ? (
        <div className="question-list">
          {filteredQuestions.map((question) => (
            <QuestionReviewCard key={question.id} onToggle={handleToggle} question={question} />
          ))}
        </div>
      ) : hasDetectedQuestions ? (
        <EmptyStateCard
          title="No questions match the current filters"
          description="Detected questions already exist for this document. Adjust the search or filters to show them again."
          action={
            <button className="button secondary" onClick={resetFilters} type="button">
              Clear filters
            </button>
          }
        />
      ) : (
        <EmptyStateCard
          title="No detected questions yet"
          description="Run question detection first to build the review set for this document."
        />
      )}
    </section>
  );
}
