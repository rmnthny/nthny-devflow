(() => {
  const STORAGE_KEY = "nthny-devflow-v01";

  const seed = {
    projects: [
      {
        id: crypto.randomUUID(),
        name: "Library QR System",
        description:
          "QR-assisted library workflow concept for attendance, borrowing, returning, and record management.",
        tech: "PHP, MySQL, HTML, CSS, JavaScript",
        status: "In Progress",
        createdAt: new Date().toISOString()
      }
    ],
    requirements: [],
    reviews: [],
    docs: {},
    activity: []
  };

  const state = load();

  if (!state.requirements.length && state.projects.length) {
    const pid = state.projects[0].id;

    state.requirements.push(
      {
        id: crypto.randomUUID(),
        projectId: pid,
        type: "Functional",
        title: "Record member attendance using QR codes",
        status: "In Progress",
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        projectId: pid,
        type: "Functional",
        title: "Track borrowing and returning transactions",
        status: "Planned",
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        projectId: pid,
        type: "Non-functional",
        title: "Provide a mobile-friendly interface",
        status: "Planned",
        createdAt: new Date().toISOString()
      }
    );

    save();
  }

  let route = "dashboard";
  let activeDocProject = state.projects[0]?.id || null;
  let activeDocTab = "overview";

  const view = document.getElementById("view");
  const pageTitle = document.getElementById("pageTitle");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalTitle = document.getElementById("modalTitle");
  const modalContent = document.getElementById("modalContent");
  const toast = document.getElementById("toast");

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : structuredClone(seed);
    } catch {
      return structuredClone(seed);
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function esc(value = "") {
    return String(value).replace(/[&<>"']/g, (c) => (
      {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[c]
    ));
  }

  function notify(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove("hidden");

    clearTimeout(notify._t);

    notify._t = setTimeout(() => {
      toast.classList.add("hidden");
    }, 2200);
  }

  function projectById(id) {
    return state.projects.find((p) => p.id === id);
  }

  function projectProgress(projectId) {
    const reqs = state.requirements.filter(
      (r) => r.projectId === projectId
    );

    if (!reqs.length) return 0;

    const done = reqs.filter(
      (r) => r.status === "Done"
    ).length;

    return Math.round((done / reqs.length) * 100);
  }

  function badge(status) {
    const cls =
      status === "Done" || status === "Completed"
        ? "green"
        : status === "In Progress"
        ? "gold"
        : status === "Blocked"
        ? "red"
        : "blue";

    return `<span class="chip ${cls}">${esc(status)}</span>`;
  }

  function render() {
    document.querySelectorAll(".nav-item").forEach((b) => {
      b.classList.toggle(
        "active",
        b.dataset.route === route
      );
    });

    const titles = {
      dashboard: "Dashboard",
      projects: "Projects",
      requirements: "Requirements",
      reviews: "Code Reviews",
      docs: "Documentation"
    };

    pageTitle.textContent = titles[route] || "DevFlow";

    if (route === "dashboard") renderDashboard();
    if (route === "projects") renderProjects();
    if (route === "requirements") renderRequirements();
    if (route === "reviews") renderReviews();
    if (route === "docs") renderDocs();
  }

  function renderDashboard() {
    const doneReqs = state.requirements.filter(
      (r) => r.status === "Done"
    ).length;

    const progressAvg = state.projects.length
      ? Math.round(
          state.projects.reduce(
            (sum, p) => sum + projectProgress(p.id),
            0
          ) / state.projects.length
        )
      : 0;

    view.innerHTML = `
      <div class="grid stats">
        <div class="card stat">
          <small>Projects</small>
          <strong>${state.projects.length}</strong>
          <span>Active workspace items</span>
        </div>

        <div class="card stat">
          <small>Requirements</small>
          <strong>${state.requirements.length}</strong>
          <span>${doneReqs} completed</span>
        </div>

        <div class="card stat">
          <small>Code reviews</small>
          <strong>${state.reviews.length}</strong>
          <span>Saved review sessions</span>
        </div>

        <div class="card stat">
          <small>Avg. progress</small>
          <strong>${progressAvg}%</strong>
          <span>Based on requirements</span>
        </div>
      </div>

      <div class="grid dashboard-grid">
        <div class="card panel">
          <div class="panel-head">
            <div>
              <h2>Recent projects</h2>
              <p>Current development workspaces</p>
            </div>

            <button
              class="btn small"
              data-action="new-project"
            >
              + New
            </button>
          </div>

          <div class="list">
            ${
              state.projects.length
                ? state.projects
                    .slice(0, 5)
                    .map(
                      (p) => `
                <div class="project-row">
                  <div class="row-main">
                    <strong>${esc(p.name)}</strong>

                    <span>
                      ${esc(
                        p.tech || "No tech stack set"
                      )}
                    </span>

                    <div
                      class="progress"
                      style="margin-top:10px"
                    >
                      <span
                        style="width:${projectProgress(
                          p.id
                        )}%"
                      ></span>
                    </div>
                  </div>

                  <div class="row-actions">
                    ${badge(p.status)}

                    <button
                      class="btn small"
                      data-action="open-project"
                      data-id="${p.id}"
                    >
                      Open
                    </button>
                  </div>
                </div>
              `
                    )
                    .join("")
                : `
                  <div class="empty">
                    <strong>No projects yet</strong>
                    Create your first DevFlow project.
                  </div>
                `
            }
          </div>
        </div>

        <div class="card panel">
          <div class="panel-head">
            <div>
              <h2>Workspace health</h2>
              <p>What your current data says</p>
            </div>
          </div>

          <div class="metric-list">
            ${metric(
              "Requirements completed",
              state.requirements.length
                ? Math.round(
                    (doneReqs /
                      state.requirements.length) *
                      100
                  )
                : 0
            )}

            ${metric(
              "Projects with documentation",
              docsCoverage()
            )}

            ${metric(
              "Projects reviewed",
              reviewCoverage()
            )}
          </div>

          <div
            class="notice"
            style="margin-top:18px"
          >
            DevFlow v0.2 has a backend-connected
            review prototype. The current backend
            response is
            <strong>mock-generated</strong>
            and does not yet use an AI model.
          </div>
        </div>
      </div>
    `;

    bindViewActions();
  }

  function metric(label, value) {
    return `
      <div class="metric-item">
        <div class="metric-head">
          <span>${esc(label)}</span>
          <strong>${value}%</strong>
        </div>

        <div class="progress">
          <span
            style="width:${value}%"
          ></span>
        </div>
      </div>
    `;
  }

  function docsCoverage() {
    if (!state.projects.length) return 0;

    const count = state.projects.filter((p) => {
      const d = state.docs[p.id] || {};

      return Object.values(d).some((v) =>
        String(v || "").trim()
      );
    }).length;

    return Math.round(
      (count / state.projects.length) * 100
    );
  }

  function reviewCoverage() {
    if (!state.projects.length) return 0;

    const ids = new Set(
      state.reviews.map((r) => r.projectId)
    );

    return Math.round(
      (ids.size / state.projects.length) * 100
    );
  }

  function renderProjects() {
    view.innerHTML = `
      <div class="section-stack">
        <div class="toolbar">
          <p
            style="
              color:var(--muted);
              margin:0;
            "
          >
            Create and manage software workspaces.
          </p>

          <button
            class="btn primary"
            data-action="new-project"
          >
            + Create project
          </button>
        </div>

        <div
          class="grid"
          style="
            grid-template-columns:
            repeat(
              auto-fit,
              minmax(300px,1fr)
            );
          "
        >
          ${
            state.projects.length
              ? state.projects
                  .map((p) => {
                    const reqCount =
                      state.requirements.filter(
                        (r) =>
                          r.projectId === p.id
                      ).length;

                    const revCount =
                      state.reviews.filter(
                        (r) =>
                          r.projectId === p.id
                      ).length;

                    return `
                      <article
                        class="card panel"
                      >
                        <div
                          class="panel-head"
                        >
                          <div>
                            <span
                              class="chip gold"
                            >
                              ${esc(
                                p.status
                              )}
                            </span>
                          </div>

                          <button
                            class="icon-btn"
                            data-action="edit-project"
                            data-id="${p.id}"
                            title="Edit"
                          >
                            ⋯
                          </button>
                        </div>

                        <h2>
                          ${esc(p.name)}
                        </h2>

                        <p
                          style="
                            color:var(--muted)
                          "
                        >
                          ${esc(
                            p.description ||
                              "No description yet."
                          )}
                        </p>

                        <div
                          style="
                            display:flex;
                            gap:8px;
                            flex-wrap:wrap;
                            margin:18px 0;
                          "
                        >
                          <span class="chip">
                            ${reqCount}
                            requirements
                          </span>

                          <span class="chip">
                            ${revCount}
                            reviews
                          </span>

                          <span class="chip">
                            ${projectProgress(
                              p.id
                            )}%
                            complete
                          </span>
                        </div>

                        <div class="progress">
                          <span
                            style="
                              width:
                              ${projectProgress(
                                p.id
                              )}%
                            "
                          ></span>
                        </div>

                        <div
                          class="row-actions"
                          style="
                            margin-top:18px;
                            justify-content:
                            flex-start;
                          "
                        >
                          <button
                            class="btn small"
                            data-action="open-project"
                            data-id="${p.id}"
                          >
                            Open workspace
                          </button>

                          <button
                            class="btn small danger"
                            data-action="delete-project"
                            data-id="${p.id}"
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    `;
                  })
                  .join("")
              : `
                <div class="empty">
                  <strong>No projects yet</strong>
                  Create your first DevFlow project.
                </div>
              `
          }
        </div>
      </div>
    `;

    bindViewActions();
  }

  function renderRequirements(
    projectFilter = "all"
  ) {
    const rows =
      projectFilter === "all"
        ? state.requirements
        : state.requirements.filter(
            (r) =>
              r.projectId === projectFilter
          );

    view.innerHTML = `
      <div class="section-stack">
        <div class="toolbar">
          <select
            id="reqProjectFilter"
            style="max-width:300px"
          >
            <option value="all">
              All projects
            </option>

            ${state.projects
              .map(
                (p) => `
                  <option
                    value="${p.id}"
                    ${
                      projectFilter === p.id
                        ? "selected"
                        : ""
                    }
                  >
                    ${esc(p.name)}
                  </option>
                `
              )
              .join("")}
          </select>

          <button
            class="btn primary"
            data-action="new-requirement"
          >
            + Add requirement
          </button>
        </div>

        <div class="card panel">
          <div class="panel-head">
            <div>
              <h2>Requirements</h2>

              <p>
                Functional and non-functional
                requirements across your projects
              </p>
            </div>
          </div>

          <div class="list">
            ${
              rows.length
                ? rows
                    .map((r) => {
                      const p = projectById(
                        r.projectId
                      );

                      return `
                        <div class="req-row">
                          <div
                            class="row-main"
                          >
                            <strong>
                              ${esc(
                                r.title
                              )}
                            </strong>

                            <span>
                              ${esc(
                                p?.name ||
                                  "Unknown project"
                              )}
                              ·
                              ${esc(
                                r.type
                              )}
                            </span>
                          </div>

                          <div
                            class="row-actions"
                          >
                            ${badge(
                              r.status
                            )}

                            <button
                              class="btn small"
                              data-action="edit-requirement"
                              data-id="${r.id}"
                            >
                              Edit
                            </button>

                            <button
                              class="btn small danger"
                              data-action="delete-requirement"
                              data-id="${r.id}"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      `;
                    })
                    .join("")
                : `
                  <div class="empty">
                    <strong>
                      No requirements found
                    </strong>

                    Add one to start tracking
                    project scope.
                  </div>
                `
            }
          </div>
        </div>
      </div>
    `;

    document
      .getElementById(
        "reqProjectFilter"
      )
      ?.addEventListener(
        "change",
        (e) =>
          renderRequirements(
            e.target.value
          )
      );

    bindViewActions();
  }

  function renderReviews() {
    view.innerHTML = `
      <div class="section-stack">
        <div class="toolbar">
          <p
            style="
              color:var(--muted);
              margin:0;
            "
          >
            Run structured code-review sessions
            and save findings.
          </p>

          <button
            class="btn primary"
            data-action="new-review"
          >
            + New code review
          </button>
        </div>

        <div class="card panel">
          <div class="panel-head">
            <div>
              <h2>Saved reviews</h2>

              <p>
                Review sessions stored
                in this browser
              </p>
            </div>
          </div>

          <div class="list">
            ${
              state.reviews.length
                ? state.reviews
                    .map((r) => {
                      const p = projectById(
                        r.projectId
                      );

                      return `
                        <div class="review-row">
                          <div
                            class="row-main"
                          >
                            <strong>
                              ${esc(
                                r.title
                              )}
                            </strong>

                            <span>
                              ${esc(
                                p?.name ||
                                  "Unknown project"
                              )}
                              ·
                              ${esc(
                                r.language
                              )}
                              ·
                              ${new Date(
                                r.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>

                          <div
                            class="row-actions"
                          >
                            <span
                              class="chip"
                            >
                              ${
                                r.checks?.filter(
                                  Boolean
                                ).length || 0
                              }/6 checks
                            </span>

                            <button
                              class="btn small"
                              data-action="view-review"
                              data-id="${r.id}"
                            >
                              View
                            </button>

                            <button
                              class="btn small danger"
                              data-action="delete-review"
                              data-id="${r.id}"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      `;
                    })
                    .join("")
                : `
                  <div class="empty">
                    <strong>
                      No code reviews yet
                    </strong>

                    Start a structured review
                    and save your notes.
                  </div>
                `
            }
          </div>
        </div>
      </div>
    `;

    bindViewActions();
  }

  function renderDocs(
    projectId = activeDocProject
  ) {
    if (
      !projectId &&
      state.projects.length
    ) {
      projectId =
        state.projects[0].id;
    }

    activeDocProject = projectId;

    const p =
      projectById(projectId);

    if (!p) {
      view.innerHTML = `
        <div class="empty">
          <strong>
            No project selected
          </strong>

          Create a project before
          writing documentation.
        </div>
      `;

      return;
    }

    const doc =
      state.docs[projectId] || {};

    const tabs = [
      ["overview", "Overview"],
      [
        "architecture",
        "Architecture"
      ],
      ["database", "Database"],
      ["issues", "Known issues"],
      ["roadmap", "Roadmap"]
    ];

    view.innerHTML = `
      <div class="section-stack">
        <div class="toolbar">
          <select
            id="docsProjectSelect"
            style="max-width:320px"
          >
            ${state.projects
              .map(
                (x) => `
                  <option
                    value="${x.id}"
                    ${
                      x.id === projectId
                        ? "selected"
                        : ""
                    }
                  >
                    ${esc(x.name)}
                  </option>
                `
              )
              .join("")}
          </select>

          <button
            class="btn"
            data-action="export-markdown"
            data-id="${projectId}"
          >
            Export Markdown
          </button>
        </div>

        <div class="card panel">
          <div class="panel-head">
            <div>
              <h2>
                ${esc(
                  p.name
                )} documentation
              </h2>

              <p>
                Maintain living technical notes
                for the project.
              </p>
            </div>

            <button
              class="btn primary small"
              data-action="save-docs"
            >
              Save documentation
            </button>
          </div>

          <div class="doc-tabs">
            ${tabs
              .map(
                ([id, label]) => `
                  <button
                    class="
                      doc-tab
                      ${
                        activeDocTab ===
                        id
                          ? "active"
                          : ""
                      }
                    "
                    data-doc-tab="${id}"
                  >
                    ${label}
                  </button>
                `
              )
              .join("")}
          </div>

          <div class="field">
            <label>
              ${
                tabs.find(
                  (t) =>
                    t[0] ===
                    activeDocTab
                )?.[1] ||
                "Documentation"
              }
            </label>

            <textarea
              id="docEditor"
              style="min-height:330px"
              placeholder="Write project documentation here..."
            >${esc(
              doc[activeDocTab] || ""
            )}</textarea>

            <small>
              Stored locally in your browser.
              Export to Markdown anytime.
            </small>
          </div>
        </div>
      </div>
    `;

    document
      .getElementById(
        "docsProjectSelect"
      )
      ?.addEventListener(
        "change",
        (e) => {
          activeDocProject =
            e.target.value;

          renderDocs(
            activeDocProject
          );
        }
      );

    document
      .querySelectorAll(
        "[data-doc-tab]"
      )
      .forEach((btn) => {
        btn.addEventListener(
          "click",
          () => {
            const current =
              document.getElementById(
                "docEditor"
              )?.value || "";

            state.docs[
              activeDocProject
            ] =
              state.docs[
                activeDocProject
              ] || {};

            state.docs[
              activeDocProject
            ][activeDocTab] =
              current;

            save();

            activeDocTab =
              btn.dataset.docTab;

            renderDocs(
              activeDocProject
            );
          }
        );
      });

    bindViewActions();
  }

  function bindViewActions() {
    document
      .querySelectorAll(
        "[data-action]"
      )
      .forEach((btn) => {
        btn.addEventListener(
          "click",
          () => {
            handleAction(
              btn.dataset.action,
              btn.dataset.id
            );
          }
        );
      });
  }

  function handleAction(
    action,
    id
  ) {
    if (
      action === "new-project"
    ) {
      return openProjectModal();
    }

    if (
      action === "edit-project"
    ) {
      return openProjectModal(id);
    }

    if (
      action === "open-project"
    ) {
      route =
        "requirements";

      renderRequirements(id);

      return;
    }

    if (
      action === "delete-project"
    ) {
      return deleteProject(id);
    }

    if (
      action ===
      "new-requirement"
    ) {
      return openRequirementModal();
    }

    if (
      action ===
      "edit-requirement"
    ) {
      return openRequirementModal(
        id
      );
    }

    if (
      action ===
      "delete-requirement"
    ) {
      return deleteRequirement(
        id
      );
    }

    if (
      action === "new-review"
    ) {
      return openReviewModal();
    }

    if (
      action === "view-review"
    ) {
      return viewReview(id);
    }

    if (
      action ===
      "delete-review"
    ) {
      return deleteReview(id);
    }

    if (
      action === "save-docs"
    ) {
      return saveDocs();
    }

    if (
      action ===
      "export-markdown"
    ) {
      return exportMarkdown(id);
    }
  }

  function showModal(
    title,
    html
  ) {
    modalTitle.textContent = title;

    modalContent.innerHTML = html;

    modalBackdrop.classList.remove(
      "hidden"
    );

    setTimeout(() => {
      modalContent
        .querySelector(
          "input,select,textarea"
        )
        ?.focus();
    }, 20);
  }

  function closeModal() {
    modalBackdrop.classList.add(
      "hidden"
    );

    modalContent.innerHTML = "";
  }

  function openProjectModal(
    id = null
  ) {
    const p =
      id
        ? projectById(id)
        : null;

    showModal(
      p
        ? "Edit project"
        : "Create project",
      `
        <form id="projectForm">
          <div class="form-grid">
            <div
              class="field full"
            >
              <label>
                Project name
              </label>

              <input
                name="name"
                required
                value="${esc(
                  p?.name || ""
                )}"
                placeholder="e.g. NTHNY DevFlow"
              />
            </div>

            <div
              class="field full"
            >
              <label>
                Description
              </label>

              <textarea
                name="description"
                placeholder="What problem does this project solve?"
              >${esc(
                p?.description || ""
              )}</textarea>
            </div>

            <div class="field">
              <label>
                Tech stack
              </label>

              <input
                name="tech"
                value="${esc(
                  p?.tech || ""
                )}"
                placeholder="PHP, MySQL, JavaScript"
              />
            </div>

            <div class="field">
              <label>
                Status
              </label>

              <select name="status">
                ${[
                  "Planned",
                  "In Progress",
                  "Blocked",
                  "Completed"
                ]
                  .map(
                    (s) => `
                      <option
                        ${
                          p?.status === s
                            ? "selected"
                            : ""
                        }
                      >
                        ${s}
                      </option>
                    `
                  )
                  .join("")}
              </select>
            </div>
          </div>

          <div
            class="modal-actions"
          >
            <button
              type="button"
              class="btn"
              data-close
            >
              Cancel
            </button>

            <button
              class="btn primary"
              type="submit"
            >
              ${
                p
                  ? "Save changes"
                  : "Create project"
              }
            </button>
          </div>
        </form>
      `
    );

    modalContent
      .querySelector(
        "[data-close]"
      ).onclick = closeModal;

    modalContent
      .querySelector(
        "#projectForm"
      ).onsubmit = (e) => {
        e.preventDefault();

        const fd =
          new FormData(
            e.currentTarget
          );

        if (p) {
          Object.assign(p, {
            name:
              fd
                .get("name")
                .trim(),

            description:
              fd
                .get(
                  "description"
                )
                .trim(),

            tech:
              fd
                .get("tech")
                .trim(),

            status:
              fd.get("status")
          });
        } else {
          state.projects.unshift({
            id:
              crypto.randomUUID(),

            name:
              fd
                .get("name")
                .trim(),

            description:
              fd
                .get(
                  "description"
                )
                .trim(),

            tech:
              fd
                .get("tech")
                .trim(),

            status:
              fd.get("status"),

            createdAt:
              new Date().toISOString()
          });
        }

        save();

        closeModal();

        notify(
          p
            ? "Project updated."
            : "Project created."
        );

        render();
      };
  }

  function deleteProject(id) {
    const p =
      projectById(id);

    if (
      !p ||
      !confirm(
        `Delete "${p.name}" and its requirements, reviews, and docs?`
      )
    ) {
      return;
    }

    state.projects =
      state.projects.filter(
        (x) => x.id !== id
      );

    state.requirements =
      state.requirements.filter(
        (x) =>
          x.projectId !== id
      );

    state.reviews =
      state.reviews.filter(
        (x) =>
          x.projectId !== id
      );

    delete state.docs[id];

    save();

    notify("Project deleted.");

    render();
  }

  function openRequirementModal(
    id = null
  ) {
    if (!state.projects.length) {
      notify(
        "Create a project first."
      );
      return;
    }

    const r =
      id
        ? state.requirements.find(
            (x) => x.id === id
          )
        : null;

    showModal(
      r
        ? "Edit requirement"
        : "Add requirement",
      `
        <form id="requirementForm">
          <div class="form-grid">
            <div
              class="field full"
            >
              <label>
                Project
              </label>

              <select
                name="projectId"
              >
                ${state.projects
                  .map(
                    (p) => `
                      <option
                        value="${p.id}"
                        ${
                          r?.projectId ===
                          p.id
                            ? "selected"
                            : ""
                        }
                      >
                        ${esc(p.name)}
                      </option>
                    `
                  )
                  .join("")}
              </select>
            </div>

            <div
              class="field full"
            >
              <label>
                Requirement
              </label>

              <input
                name="title"
                required
                value="${esc(
                  r?.title || ""
                )}"
                placeholder="e.g. The system shall record QR attendance"
              />
            </div>

            <div class="field">
              <label>
                Type
              </label>

              <select name="type">
                ${[
                  "Functional",
                  "Non-functional"
                ]
                  .map(
                    (s) => `
                      <option
                        ${
                          r?.type === s
                            ? "selected"
                            : ""
                        }
                      >
                        ${s}
                      </option>
                    `
                  )
                  .join("")}
              </select>
            </div>

            <div class="field">
              <label>
                Status
              </label>

              <select name="status">
                ${[
                  "Planned",
                  "In Progress",
                  "Blocked",
                  "Done"
                ]
                  .map(
                    (s) => `
                      <option
                        ${
                          r?.status === s
                            ? "selected"
                            : ""
                        }
                      >
                        ${s}
                      </option>
                    `
                  )
                  .join("")}
              </select>
            </div>
          </div>

          <div
            class="modal-actions"
          >
            <button
              type="button"
              class="btn"
              data-close
            >
              Cancel
            </button>

            <button
              class="btn primary"
              type="submit"
            >
              ${
                r
                  ? "Save changes"
                  : "Add requirement"
              }
            </button>
          </div>
        </form>
      `
    );

    modalContent
      .querySelector(
        "[data-close]"
      ).onclick = closeModal;

    modalContent
      .querySelector(
        "#requirementForm"
      ).onsubmit = (e) => {
        e.preventDefault();

        const fd =
          new FormData(
            e.currentTarget
          );

        const data = {
          projectId:
            fd.get("projectId"),

          title:
            fd
              .get("title")
              .trim(),

          type:
            fd.get("type"),

          status:
            fd.get("status")
        };

        if (r) {
          Object.assign(
            r,
            data
          );
        } else {
          state.requirements.unshift(
            {
              id:
                crypto.randomUUID(),

              ...data,

              createdAt:
                new Date().toISOString()
            }
          );
        }

        save();

        closeModal();

        notify(
          r
            ? "Requirement updated."
            : "Requirement added."
        );

        render();
      };
  }

  function deleteRequirement(id) {
    if (
      !confirm(
        "Delete this requirement?"
      )
    ) {
      return;
    }

    state.requirements =
      state.requirements.filter(
        (r) => r.id !== id
      );

    save();

    notify(
      "Requirement deleted."
    );

    render();
  }

  async function runAIReview() {
    const projectSelect =
      modalContent.querySelector(
        '[name="projectId"]'
      );

    const languageSelect =
      modalContent.querySelector(
        '[name="language"]'
      );

    const codeInput =
      modalContent.querySelector(
        '[name="code"]'
      );

    const notesInput =
      modalContent.querySelector(
        '[name="notes"]'
      );

    const reviewButton =
      modalContent.querySelector(
        "#aiReviewBtn"
      );

    const projectId =
      projectSelect?.value;

    const language =
      languageSelect?.value;

    const code =
      codeInput?.value || "";

    const project =
      projectById(projectId);

    if (!code.trim()) {
      notify(
        "Paste code first."
      );

      codeInput?.focus();

      return;
    }

    const originalButtonText =
      reviewButton?.textContent ||
      "Run Mock Review";

    try {
      if (reviewButton) {
        reviewButton.disabled =
          true;

        reviewButton.textContent =
          "Reviewing...";
      }

      notify(
        "Sending code to DevFlow backend..."
      );

      const response =
        await fetch(
          "http://localhost:3000/api/review",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                project:
                  project?.name ||
                  "Unknown project",

                language:
                  language ||
                  "Unknown",

                code
              })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Review failed."
        );
      }

      const review =
        data.review || {};

      const strengths =
        Array.isArray(
          review.strengths
        )
          ? review.strengths
          : [];

      const issues =
        Array.isArray(
          review.issues
        )
          ? review.issues
          : [];

      const suggestions =
        Array.isArray(
          review.suggestions
        )
          ? review.suggestions
          : [];

      notesInput.value = `Summary:
${review.summary || "No summary returned."}

Strengths:
${
  strengths.length
    ? `- ${strengths.join("\n- ")}`
    : "- None returned."
}

Issues:
${
  issues.length
    ? `- ${issues.join("\n- ")}`
    : "- None returned."
}

Suggestions:
${
  suggestions.length
    ? `- ${suggestions.join("\n- ")}`
    : "- None returned."
}`;

      notify(
        "Backend review completed."
      );
    } catch (error) {
      console.error(error);

      notify(
        "Could not connect to the DevFlow backend. Make sure npm start is running."
      );
    } finally {
      if (reviewButton) {
        reviewButton.disabled =
          false;

        reviewButton.textContent =
          originalButtonText;
      }
    }
  }

  function openReviewModal() {
    if (!state.projects.length) {
      notify(
        "Create a project first."
      );
      return;
    }

    const checks = [
      [
        "Readable structure",
        "Naming and structure are understandable."
      ],
      [
        "Input validation",
        "External or user inputs are validated."
      ],
      [
        "Error handling",
        "Failure paths are handled clearly."
      ],
      [
        "Security basics",
        "No obvious unsafe handling of credentials or data."
      ],
      [
        "Database safety",
        "Queries and transactions are handled appropriately."
      ],
      [
        "Maintainability",
        "Code can be understood and changed later."
      ]
    ];

    showModal(
      "New code review",
      `
        <form id="reviewForm">
          <div class="form-grid">
            <div class="field">
              <label>
                Project
              </label>

              <select
                name="projectId"
              >
                ${state.projects
                  .map(
                    (p) => `
                      <option
                        value="${p.id}"
                      >
                        ${esc(p.name)}
                      </option>
                    `
                  )
                  .join("")}
              </select>
            </div>

            <div class="field">
              <label>
                Language
              </label>

              <select
                name="language"
              >
                ${[
                  "PHP",
                  "JavaScript",
                  "Java",
                  "SQL",
                  "C++",
                  "COBOL",
                  "Python",
                  "Other"
                ]
                  .map(
                    (x) =>
                      `<option>${x}</option>`
                  )
                  .join("")}
              </select>
            </div>

            <div
              class="field full"
            >
              <label>
                Review title
              </label>

              <input
                name="title"
                required
                placeholder="e.g. Borrowing transaction validation review"
              />
            </div>

            <div
              class="field full"
            >
              <label>
                Code / snippet
              </label>

              <textarea
                class="code-area"
                name="code"
                placeholder="Paste the code you are reviewing..."
              ></textarea>
            </div>

            <div
              class="field full"
            >
              <label>
                Review checklist
              </label>

              <div class="checklist">
                ${checks
                  .map(
                    (c, i) => `
                      <label
                        class="check-item"
                      >
                        <input
                          type="checkbox"
                          name="check${i}"
                        >

                        <div>
                          <strong>
                            ${c[0]}
                          </strong>

                          <span>
                            ${c[1]}
                          </span>
                        </div>
                      </label>
                    `
                  )
                  .join("")}
              </div>
            </div>

            <div
              class="field full"
            >
              <label>
                Findings / notes
              </label>

              <textarea
                name="notes"
                placeholder="Document bugs, risks, questions, and recommended changes..."
              ></textarea>
            </div>
          </div>

          <div
            class="notice"
            style="margin-top:14px"
          >
            DevFlow v0.2 includes a
            backend-connected review prototype.

            The current backend response is
            <strong>mock-generated</strong>
            and does not yet use an AI model.
          </div>

          <div
            class="modal-actions"
          >
            <button
              type="button"
              class="btn"
              data-close
            >
              Cancel
            </button>

            <button
              type="button"
              class="btn"
              id="aiReviewBtn"
            >
              Run Mock Review
            </button>

            <button
              class="btn primary"
              type="submit"
            >
              Save review
            </button>
          </div>
        </form>
      `
    );

    modalContent
      .querySelector(
        "[data-close]"
      ).onclick = closeModal;

    modalContent
      .querySelector(
        "#aiReviewBtn"
      )
      .addEventListener(
        "click",
        runAIReview
      );

    modalContent
      .querySelector(
        "#reviewForm"
      ).onsubmit = (e) => {
        e.preventDefault();

        const fd =
          new FormData(
            e.currentTarget
          );

        state.reviews.unshift({
          id:
            crypto.randomUUID(),

          projectId:
            fd.get("projectId"),

          language:
            fd.get("language"),

          title:
            fd
              .get("title")
              .trim(),

          code:
            fd.get("code"),

          notes:
            fd
              .get("notes")
              .trim(),

          checks:
            [
              0,
              1,
              2,
              3,
              4,
              5
            ].map(
              (i) =>
                fd.get(
                  `check${i}`
                ) === "on"
            ),

          createdAt:
            new Date().toISOString()
        });

        save();

        closeModal();

        notify(
          "Code review saved."
        );

        render();
      };
  }

  function viewReview(id) {
    const r =
      state.reviews.find(
        (x) => x.id === id
      );

    if (!r) return;

    const p =
      projectById(
        r.projectId
      );

    showModal(
      "Code review",
      `
        <div class="section-stack">
          <div>
            <h2>
              ${esc(r.title)}
            </h2>

            <p
              style="
                color:var(--muted);
                margin:5px 0;
              "
            >
              ${esc(
                p?.name ||
                  "Unknown project"
              )}
              ·
              ${esc(r.language)}
              ·
              ${new Date(
                r.createdAt
              ).toLocaleString()}
            </p>
          </div>

          <div
            class="panel"
            style="
              padding:16px;
              box-shadow:none;
            "
          >
            <strong>
              Checklist
            </strong>

            <div
              style="
                display:flex;
                gap:7px;
                flex-wrap:wrap;
                margin-top:10px;
              "
            >
              ${r.checks
                .map(
                  (v, i) => `
                    <span
                      class="
                        chip
                        ${
                          v
                            ? "green"
                            : "red"
                        }
                      "
                    >
                      ${
                        v
                          ? "✓"
                          : "○"
                      }
                      Check
                      ${i + 1}
                    </span>
                  `
                )
                .join("")}
            </div>
          </div>

          <div class="field">
            <label>
              Code
            </label>

            <pre
              class="doc-preview"
            >${esc(
              r.code ||
                "(No code pasted)"
            )}</pre>
          </div>

          <div class="field">
            <label>
              Findings
            </label>

            <div
              class="doc-preview"
            >${esc(
              r.notes ||
                "(No findings recorded)"
            )}</div>
          </div>

          <div
            class="modal-actions"
          >
            <button
              class="btn primary"
              data-close
            >
              Close
            </button>
          </div>
        </div>
      `
    );

    modalContent
      .querySelector(
        "[data-close]"
      ).onclick = closeModal;
  }

  function deleteReview(id) {
    if (
      !confirm(
        "Delete this code review?"
      )
    ) {
      return;
    }

    state.reviews =
      state.reviews.filter(
        (r) => r.id !== id
      );

    save();

    notify(
      "Review deleted."
    );

    render();
  }

  function saveDocs() {
    if (!activeDocProject) {
      return;
    }

    state.docs[
      activeDocProject
    ] =
      state.docs[
        activeDocProject
      ] || {};

    state.docs[
      activeDocProject
    ][activeDocTab] =
      document.getElementById(
        "docEditor"
      )?.value || "";

    save();

    notify(
      "Documentation saved."
    );
  }

  function exportMarkdown(
    projectId
  ) {
    saveDocs();

    const p =
      projectById(projectId);

    if (!p) return;

    const d =
      state.docs[projectId] ||
      {};

    const reqs =
      state.requirements.filter(
        (r) =>
          r.projectId ===
          projectId
      );

    const reviews =
      state.reviews.filter(
        (r) =>
          r.projectId ===
          projectId
      );

    const md = `# ${p.name}

## Overview
${
  d.overview ||
  p.description ||
  "No overview yet."
}

## Tech Stack
${p.tech || "Not specified"}

## Status
${p.status}

## Requirements
${
  reqs.length
    ? reqs
        .map(
          (r) =>
            `- [${
              r.status ===
              "Done"
                ? "x"
                : " "
            }] **${
              r.type
            }** — ${
              r.title
            } (${
              r.status
            })`
        )
        .join("\n")
    : "No requirements yet."
}

## Architecture
${
  d.architecture ||
  "No architecture notes yet."
}

## Database
${
  d.database ||
  "No database notes yet."
}

## Known Issues
${
  d.issues ||
  "No known issues documented."
}

## Roadmap
${
  d.roadmap ||
  "No roadmap documented."
}

## Code Reviews
${
  reviews.length
    ? reviews
        .map(
          (r) =>
            `- ${
              r.title
            } — ${
              r.language
            } — ${new Date(
              r.createdAt
            ).toLocaleDateString()}`
        )
        .join("\n")
    : "No saved reviews."
}

---
Generated by NTHNY DevFlow v0.2
`;

    download(
      `${slug(
        p.name
      )}-documentation.md`,
      md,
      "text/markdown"
    );

    notify(
      "Markdown documentation exported."
    );
  }

  function exportAll() {
    download(
      `nthny-devflow-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`,

      JSON.stringify(
        state,
        null,
        2
      ),

      "application/json"
    );

    notify(
      "DevFlow data exported."
    );
  }

  function download(
    filename,
    content,
    type
  ) {
    const blob =
      new Blob(
        [content],
        { type }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const a =
      document.createElement(
        "a"
      );

    a.href = url;
    a.download = filename;
    a.click();

    setTimeout(
      () =>
        URL.revokeObjectURL(
          url
        ),
      500
    );
  }

  function slug(s) {
    return String(s)
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /(^-|-$)/g,
        ""
      );
  }

  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach((btn) => {
      btn.addEventListener(
        "click",
        () => {
          route =
            btn.dataset.route;

          document
            .querySelector(
              ".sidebar"
            )
            .classList.remove(
              "open"
            );

          render();
        }
      );
    });

  document
    .querySelector(
      ".brand"
    )
    .addEventListener(
      "click",
      (e) => {
        e.preventDefault();

        route =
          "dashboard";

        render();
      }
    );

  document
    .getElementById(
      "newProjectTop"
    )
    .addEventListener(
      "click",
      () =>
        openProjectModal()
    );

  document
    .getElementById(
      "exportBtn"
    )
    .addEventListener(
      "click",
      exportAll
    );

  document
    .getElementById(
      "modalClose"
    )
    .addEventListener(
      "click",
      closeModal
    );

  modalBackdrop.addEventListener(
    "click",
    (e) => {
      if (
        e.target ===
        modalBackdrop
      ) {
        closeModal();
      }
    }
  );

  document.addEventListener(
    "keydown",
    (e) => {
      if (
        e.key === "Escape" &&
        !modalBackdrop.classList.contains(
          "hidden"
        )
      ) {
        closeModal();
      }
    }
  );

  document
    .getElementById(
      "mobileMenu"
    )
    .addEventListener(
      "click",
      () => {
        document
          .querySelector(
            ".sidebar"
          )
          .classList.toggle(
            "open"
          );
      }
    );

  render();
})();
