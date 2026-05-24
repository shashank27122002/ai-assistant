const fs = require("fs");
const pdfParse = require("pdf-parse");

const { generateAIResponse } = require("../services/geminiService");

const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required",
      });
    }

    const pdfBuffer = fs.readFileSync(req.file.path);

    const pdfData = await pdfParse(pdfBuffer);

    const prompt = `
You are an expert resume reviewer.

Analyze this resume and provide:

1. Resume Summary
2. ATS Score out of 100
3. Strengths
4. Weaknesses
5. Improvement Suggestions

Resume Content:

${pdfData.text}
`;

    const reply = await generateAIResponse([
      {
        role: "user",
        content: prompt,
      },
    ]);

    res.status(200).json({
      success: true,
      analysis: reply,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  analyzeResume,
};