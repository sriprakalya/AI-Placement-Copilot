// ================= NAVIGATION =================

const menuBtn = document.getElementById("menuBtn");

const navLinks = document.querySelector(".nav-links");

menuBtn.addEventListener("click", () => {

    navLinks.classList.toggle("active");

});

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {

        navLinks.classList.remove("active");

    });

});


// ================= DASHBOARD BUTTON =================

const dashboardBtn = document.getElementById("dashboardBtn");

dashboardBtn.addEventListener("click", () => {

    document.getElementById("dashboard").scrollIntoView({
        behavior: "smooth"
    });

});


// ================= DASHBOARD STATE =================

let dashboardState = {

    resumeSkills: [],

    resumeAnalyzed: false,

    targetRole: "",

    jobAnalysis: null

};


function saveDashboardState() {

    localStorage.setItem(
        "placementCopilotDashboard",
        JSON.stringify(dashboardState)
    );

}


function loadDashboardState() {

    const saved =
        localStorage.getItem("placementCopilotDashboard");

    if (saved) {

        try {

            dashboardState =
                JSON.parse(saved);

        } catch (error) {

            console.error(
                "Dashboard state could not be loaded:",
                error
            );

        }

    }

    updateDashboard();

}


function calculateReadiness() {

    if (
        !dashboardState.jobAnalysis ||
        dashboardState.jobAnalysis.requiredSkills.length === 0
    ) {

        return 0;

    }

    const required =
        dashboardState.jobAnalysis.requiredSkills;

    const gaps =
        dashboardState.jobAnalysis.skillGap;

    const matched =
        required.length - gaps.length;

    return Math.round(
        (matched / required.length) * 100
    );

}


function updateDashboard() {

    const resumeSkills =
        dashboardState.resumeSkills || [];

    const job =
        dashboardState.jobAnalysis;

    const requiredSkills =
        job ? job.requiredSkills : [];

    const skillGap =
        job ? job.skillGap : [];

    const matchedSkills =
        Math.max(
            requiredSkills.length - skillGap.length,
            0
        );

    const readiness =
        calculateReadiness();


    // ================= HERO =================

    const heroReadiness =
        document.getElementById("heroReadiness");

    const heroReadinessBar =
        document.getElementById("heroReadinessBar");

    const heroReadinessMessage =
        document.getElementById("heroReadinessMessage");


    if (heroReadiness) {

        heroReadiness.textContent =
            `${readiness}%`;

    }


    if (heroReadinessBar) {

        heroReadinessBar.style.width =
            `${readiness}%`;

    }


    if (heroReadinessMessage) {

        if (!dashboardState.resumeAnalyzed) {

            heroReadinessMessage.textContent =
                "Analyze your resume to begin.";

        } else if (!job) {

            heroReadinessMessage.textContent =
                "Analyze a job description to calculate your readiness.";

        } else {

            heroReadinessMessage.textContent =
                `${matchedSkills} of ${requiredSkills.length} required skills matched.`;

        }

    }


    // ================= DASHBOARD STATS =================

    const dashboardReadiness =
        document.getElementById("dashboardReadiness");

    const dashboardReadinessNote =
        document.getElementById("dashboardReadinessNote");

    const dashboardMatchedSkills =
        document.getElementById("dashboardMatchedSkills");

    const dashboardMatchedNote =
        document.getElementById("dashboardMatchedNote");

    const dashboardSkillGaps =
        document.getElementById("dashboardSkillGaps");

    const dashboardGapNote =
        document.getElementById("dashboardGapNote");

    const dashboardResumeSkills =
        document.getElementById("dashboardResumeSkills");

    const dashboardResumeNote =
        document.getElementById("dashboardResumeNote");


    if (dashboardReadiness) {

        dashboardReadiness.textContent =
            `${readiness}%`;

    }


    if (dashboardReadinessNote) {

        dashboardReadinessNote.textContent =
            job
                ? `${matchedSkills} of ${requiredSkills.length} matched`
                : "Analyze a job to calculate readiness.";

    }


    if (dashboardMatchedSkills) {

        dashboardMatchedSkills.textContent =
            matchedSkills;

    }


    if (dashboardMatchedNote) {

        dashboardMatchedNote.textContent =
            job
                ? `For ${job.role}`
                : "No job analysis yet.";

    }


    if (dashboardSkillGaps) {

        dashboardSkillGaps.textContent =
            skillGap.length;

    }


    if (dashboardGapNote) {

        dashboardGapNote.textContent =
            skillGap.length > 0
                ? "Skills to improve"
                : job
                    ? "No skill gaps found"
                    : "No job analysis yet.";

    }


    if (dashboardResumeSkills) {

        dashboardResumeSkills.textContent =
            resumeSkills.length;

    }


    if (dashboardResumeNote) {

        dashboardResumeNote.textContent =
            dashboardState.resumeAnalyzed
                ? "Detected from your resume"
                : "Resume not analyzed.";

    }


    // ================= PREPARATION PROGRESS =================

    const dashboardProgressPercent =
        document.getElementById(
            "dashboardProgressPercent"
        );


    if (dashboardProgressPercent) {

        dashboardProgressPercent.textContent =
            `${readiness}%`;

    }

}


// ================= RESUME ANALYSIS =================

const analyzeResumeBtn =
    document.getElementById("analyzeResumeBtn");

const resumeMessage =
    document.getElementById("resumeMessage");


// Stores the skills detected from the latest resume analysis
let resumeSkills = [];


analyzeResumeBtn.addEventListener("click", async () => {

    const name =
        document.getElementById("studentName").value.trim();

    const targetRole =
        document.getElementById("targetRole").value.trim();

    const resumeFile =
        document.getElementById("resumeFile").files[0];


    if (!name) {

        resumeMessage.textContent =
            "Please enter your name.";

        return;

    }


    if (!targetRole) {

        resumeMessage.textContent =
            "Please enter your target role.";

        return;

    }


    if (!resumeFile) {

        resumeMessage.textContent =
            "Please upload your resume.";

        return;

    }


    resumeMessage.textContent =
        "Uploading your resume...";


    const formData = new FormData();

    formData.append("name", name);

    formData.append("target_role", targetRole);

    formData.append("resume", resumeFile);


    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/resume/analyze",
            {
                method: "POST",
                body: formData
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail || "Resume upload failed."
            );

        }


        const detectedSkills =
            data.detected_skills || [];

        const requiredSkills =
            data.required_skills || [];

        const skillGap =
            data.skill_gap || [];


        // Save resume skills for Job Analysis
        resumeSkills = detectedSkills;


        // ================= SAVE DASHBOARD DATA =================

        dashboardState.resumeSkills =
            detectedSkills;

        dashboardState.resumeAnalyzed =
            true;

        dashboardState.targetRole =
            targetRole;

        saveDashboardState();

        updateDashboard();


        resumeMessage.innerHTML = `

            <strong>${data.message}</strong><br><br>

            Name: ${data.name}<br>

            Target Role: ${data.target_role}<br>

            Resume: ${data.filename}<br>

            Characters extracted: ${data.resume_length}<br><br>


            <strong>Skills Found in Your Resume:</strong><br>

            ${
                detectedSkills.length > 0
                    ? detectedSkills.join(", ")
                    : "No supported skills detected."
            }


            <br><br>


            <strong>Skills Required for Your Role:</strong><br>

            ${
                requiredSkills.length > 0
                    ? requiredSkills.join(", ")
                    : "No role requirements found."
            }


            <br><br>


            <strong>Skill Gap:</strong><br>

            ${
                skillGap.length > 0
                    ? skillGap.join(", ")
                    : "No skill gaps found. Great job!"
            }

        `;


        console.log(
            "Resume analysis:",
            data
        );


    } catch (error) {

        resumeMessage.textContent =
            `Could not analyze resume: ${error.message}`;

        console.error(
            "Resume analysis error:",
            error
        );

    }

});


// ================= JOB ANALYSIS =================

const analyzeJobBtn =
    document.getElementById("analyzeJobBtn");

const jobMessage =
    document.getElementById("jobMessage");


analyzeJobBtn.addEventListener("click", async () => {

    const role =
        document.getElementById("jobRole").value.trim();

    const company =
        document.getElementById("companyName").value.trim();

    const description =
        document.getElementById("jobDescription").value.trim();


    if (!role) {

        jobMessage.textContent =
            "Please enter the target role.";

        return;

    }


    if (!company) {

        jobMessage.textContent =
            "Please enter the company name.";

        return;

    }


    if (!description) {

        jobMessage.textContent =
            "Please paste the job description.";

        return;

    }


    if (resumeSkills.length === 0) {

        jobMessage.textContent =
            "Please analyze your resume first so the job can be compared with your skills.";

        return;

    }


    jobMessage.textContent =
        "Analyzing job description...";


    const formData = new FormData();

    formData.append("role", role);

    formData.append("company", company);

    formData.append("description", description);

    formData.append(
        "resume_skills",
        resumeSkills.join(",")
    );


    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/job/analyze",
            {
                method: "POST",
                body: formData
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail || "Job analysis failed."
            );

        }


        const requiredSkills =
            data.required_skills || [];

        const detectedResumeSkills =
            data.resume_skills || [];

        const skillGap =
            data.skill_gap || [];


        // ================= SAVE JOB DATA =================

        dashboardState.jobAnalysis = {

            role: data.role,

            company: data.company,

            requiredSkills: requiredSkills,

            skillGap: skillGap

        };


        dashboardState.targetRole =
            data.role;


        saveDashboardState();

        updateDashboard();


        jobMessage.innerHTML = `

            <strong>${data.message}</strong><br><br>

            Role: ${data.role}<br>

            Company: ${data.company}<br><br>


            <strong>Skills Required by Job:</strong><br>

            ${
                requiredSkills.length > 0
                    ? requiredSkills.join(", ")
                    : "No supported skills detected."
            }


            <br><br>


            <strong>Your Resume Skills:</strong><br>

            ${
                detectedResumeSkills.length > 0
                    ? detectedResumeSkills.join(", ")
                    : "No skills detected."
            }


            <br><br>


            <strong>Skill Gap:</strong><br>

            ${
                skillGap.length > 0
                    ? skillGap.join(", ")
                    : "No skill gap found. Great match!"
            }

        `;


        console.log(
            "Job analysis:",
            data
        );


    } catch (error) {

        jobMessage.textContent =
            `Could not analyze job: ${error.message}`;

        console.error(
            "Job analysis error:",
            error
        );

    }

});


// ================= INTERVIEW =================

const submitAnswerBtn =
    document.getElementById("submitAnswerBtn");

const interviewMessage =
    document.getElementById("interviewMessage");


submitAnswerBtn.addEventListener("click", () => {

    const answer =
        document.getElementById("interviewAnswer").value.trim();


    if (!answer) {

        interviewMessage.textContent =
            "Please type your answer before submitting.";

        return;

    }


    interviewMessage.textContent =
        "Answer submitted! AI evaluation will be connected in the backend stage.";

});


// ================= BACKEND CONNECTION =================

async function checkBackend() {

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/api/health"
            );


        const data =
            await response.json();


        console.log(
            "Backend:",
            data
        );


    } catch (error) {

        console.error(
            "Backend connection failed:",
            error
        );

    }

}

checkBackend();


// ================= STUDENT API =================

const sendStudent =
    document.getElementById("sendStudent");


sendStudent.addEventListener("click", async () => {

    const name =
        document.getElementById("studentName").value;

    const email =
        document.getElementById("studentEmail").value;

    const targetRole =
        document.getElementById("targetRole").value;


    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/students",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name: name,

                    email: email,

                    target_role: targetRole

                })
            }
        );


        const data =
            await response.json();


        const resultMessage =
            document.getElementById("studentResult");


        if (response.ok) {

            resultMessage.textContent =
                data.message;

            resultMessage.style.color =
                "green";

        } else {

            resultMessage.textContent =
                data.detail ||
                "Something went wrong.";

            resultMessage.style.color =
                "red";

        }


        console.log(data);


    } catch (error) {

        console.error(
            "Backend connection failed:",
            error
        );

    }

});


// ================= DISPLAY STUDENTS =================

document.getElementById("loadStudents")
    .addEventListener("click", async () => {

        const studentsList =
            document.getElementById("studentsList");


        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8000/api/students"
                );


            const data =
                await response.json();


            if (!response.ok) {

                studentsList.textContent =
                    "Could not load students.";

                return;

            }


            studentsList.innerHTML = "";


            if (data.students.length === 0) {

                studentsList.textContent =
                    "No students saved yet.";

                return;

            }


            data.students.forEach(student => {

                const item =
                    document.createElement("p");


                item.textContent =
                    `${student.name} | ${student.email} | ${student.target_role}`;


                studentsList.appendChild(item);

            });


        } catch (error) {

            studentsList.textContent =
                "Could not connect to the backend.";

            console.error(error);

        }

    });


// ================= LOAD DASHBOARD =================

loadDashboardState();