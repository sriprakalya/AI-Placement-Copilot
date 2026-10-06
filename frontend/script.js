
// ================= NAVIGATION =================

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.querySelector(".nav-links");

menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

// Close mobile menu after clicking a link
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


// ================= RESUME ANALYSIS =================

const analyzeResumeBtn = document.getElementById("analyzeResumeBtn");
const resumeMessage = document.getElementById("resumeMessage");

analyzeResumeBtn.addEventListener("click", async () => {

    const name =
        document.getElementById("studentName").value.trim();

    const targetRole =
        document.getElementById("targetRole").value.trim();

    const resumeFile =
        document.getElementById("resumeFile").files[0];

    if (!name) {
        resumeMessage.textContent = "Please enter your name.";
        return;
    }

    if (!targetRole) {
        resumeMessage.textContent = "Please enter your target role.";
        return;
    }

    if (!resumeFile) {
        resumeMessage.textContent = "Please upload your resume.";
        return;
    }

    resumeMessage.textContent = "Uploading your resume...";

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

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Resume upload failed."
            );
        }

        const detectedSkills = data.detected_skills || [];
        const requiredSkills = data.required_skills || [];
        const skillGap = data.skill_gap || [];

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

        console.log("Resume analysis:", data);

    } catch (error) {

        resumeMessage.textContent =
            `Could not analyze resume: ${error.message}`;

        console.error("Resume analysis error:", error);
    }
});


// ================= JOB ANALYSIS =================

const analyzeJobBtn = document.getElementById("analyzeJobBtn");
const jobMessage = document.getElementById("jobMessage");

analyzeJobBtn.addEventListener("click", () => {

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

    jobMessage.textContent =
        "Job description received! AI analysis will be connected in the backend stage.";
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
            await fetch("http://127.0.0.1:8000/api/health");

        const data = await response.json();

        console.log("Backend:", data);

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

        const data = await response.json();

        const resultMessage =
            document.getElementById("studentResult");

        if (response.ok) {

            resultMessage.textContent =
                data.message;

            resultMessage.style.color = "green";

        } else {

            resultMessage.textContent =
                data.detail || "Something went wrong.";

            resultMessage.style.color = "red";
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

            const data = await response.json();

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