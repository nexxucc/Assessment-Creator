import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ["easy", "moderate", "hard"],
      required: true
    },
    marks: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const SectionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    instruction: {
      type: String,
      required: true,
      trim: true
    },
    questions: {
      type: [QuestionSchema],
      required: true
    }
  },
  { _id: false }
);

const AnswerKeySchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const ResultSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    school: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    className: {
      type: String,
      required: true
    },
    timeAllowed: {
      type: Number,
      required: true
    },
    totalMarks: {
      type: Number,
      required: true
    },
    sections: {
      type: [SectionSchema],
      required: true
    },
    answerKey: {
      type: [AnswerKeySchema],
      required: true
    }
  },
  { timestamps: true }
);

ResultSchema.index({ assignmentId: 1, createdAt: -1 });

export const ResultModel =
  mongoose.models.Result ||
  mongoose.model("Result", ResultSchema);
