import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EmptyStateCard } from "../../components/ui/EmptyStateCard.jsx";
import { AnswerPreviewCard } from "../../components/ui/AnswerPreviewCard.jsx";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  detectQuestions,
  generateAnswers,
  getDocument,
  getLatestGenerationForDocument,
  listDetectedQuestions,
} from "../../services/api/index.js";

export function AnswerGenerationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [document, setDocument] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [generation, setGeneration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [documentResponse, questionsResponse, generationResponse] = await Promise.all([
          getDocument(accessToken, id),
          listDetectedQuestions(accessToken, id),
          getLatestGenerationForDocument(accessToken, id),
        ]);

        if (!active) {
          return;
        }

        setDocument(documentResponse.data.document);
        setQuestions(questionsResponse.data.questions);
        setGeneration(generationResponse.data.generation || null);
      } catch (error) {
        if (active) {
          setFeedback({ type: "error", message: error.message || "Unable to load answer generation workspace." });
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

  const selectedQuestions = useMemo(
    () => questions.filter((question) => question.selectedForGeneration),
    [questions],
  );

  async function ensureQuestionsExist() {
    if (questions.length > 0) {
      return true;
    }

    try {
      await detectQuestions(accessToken, id, {
        prompt: "",
        forceRerun: false,
      });
      const refreshedQuestions = await listDetectedQuestions(accessToken, id);
      setQuestions(refreshedQuestions.data.questions);
      return true;
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to prepare questions for answer generation." });
      return false;
    }
  }

  async function handleGenerate(forceRegenerate = false) {
    setFeedback({ type: "", message: "" });
    setIsGenerating(true);

    try {
      const hasQuestions = await ensureQuestionsExist();
      if (!hasQuestions) {
        return;
      }

      const response = await generateAnswers(accessToken, {
        documentId: id,
        prompt,
        questionIds: selectedQuestions.map((question) => question.id),
        forceRegenerate,
      });

      setGeneration(response.data.generation);
      setFeedback({ type: "success", message: "Answers generated successfully." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to generate answers." });
    } finally {
      setIsGenerating(false);
    }
  }

  if (isLoading) {
    return <LoadingCard message="Loading answer generation workspace..." />;
  }

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Answer generation"
        title={document?.documentTitle || document?.originalName || "Answer generation"}
        description="Generate compact exam-oriented answers for your selected questions and review the mini-figure plan before final PDF rendering."
        action={
          <StatusBadge tone={generation?.generationStatus === "completed" ? "success" : "neutral"}>
            {generation?.generationStatus || "not generated"}
          </StatusBadge>
        }
      />

      {feedback.message ? (
        <p className={feedback.type === "error" ? "form-error" : "form-success"}>{feedback.message}</p>
      ) : null}

      <div className="two-column-grid detection-grid">
        <article className="detail-card">
          <SectionHeader
            eyebrow="Selected questions"
            title="Question set summary"
            description="Only selected questions move forward into answer generation."
          />
          <div className="document-meta-row">
            <span>{questions.length} detected</span>
            <span>{selectedQuestions.length} selected</span>
          </div>
          {selectedQuestions.length ? (
            <div className="activity-list">
              {selectedQuestions.map((question) => (
                <article className="activity-item" key={question.id}>
                  <strong>{question.questionNumber || "Question"}</strong>
                  <span className="support-copy">{question.questionText}</span>
                </article>
              ))}
            </div>
          ) : (
            <EmptyStateCard
              title="No selected questions"
              description="Go back to the question review step and select the questions you want to answer."
              action={<Link className="button secondary" to={`/app/documents/${id}/questions`}>Review questions</Link>}
            />
          )}
        </article>

        <form
          className="detail-card detection-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleGenerate(Boolean(generation));
          }}
        >
          <SectionHeader
            eyebrow="Prompt refinement"
            title="Guide answer style"
            description="Use this prompt to refine tone, focus, or depth while keeping answers compact and exam-ready."
          />
          <label className="field">
            <span>Answer refinement prompt</span>
            <textarea
              className="input textarea"
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Focus on important points for last-minute revision and keep long answers structured but compact."
              value={prompt}
            />
          </label>
          <div className="hero-actions">
            <button className="button primary" disabled={isGenerating || selectedQuestions.length === 0} type="submit">
              {isGenerating ? "Generating answers..." : generation ? "Regenerate answers" : "Generate answers"}
            </button>
            {generation ? (
              <button
                className="button secondary"
                onClick={() => navigate(`/app/generated-pdfs/${generation.id}`)}
                type="button"
              >
                Open preview
              </button>
            ) : null}
          </div>
        </form>
      </div>

      {generation?.answerItems?.length ? (
        <div className="answer-list">
          {generation.answerItems.map((item) => (
            <AnswerPreviewCard item={item} key={`${item.questionId}-${item.order}`} />
          ))}
        </div>
      ) : (
        <EmptyStateCard
          title="No answers generated yet"
          description="Generate the selected questions first to preview compact answer drafts and mini-figure planning."
        />
      )}
    </section>
  );
}
