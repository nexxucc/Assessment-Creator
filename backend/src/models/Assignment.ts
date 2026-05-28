import mongoose from "mongoose";

const QuestionTypeConfigSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["mcq", "short", "diagram", "numerical", "custom"],
      required: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    count: {
      type: Number,
      required: true,
      min: 1
    },
    marks: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const AssignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    questionTypes: {
      type: [QuestionTypeConfigSchema],
      required: true,
      validate: {
        validator(value: unknown[]) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one question type is required"
      }
    },
    additionalInfo: {
      type: String,
      default: ""
    },
    fileUrl: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "queued", "processing", "done", "failed"],
      default: "pending"
    },
    jobId: {
      type: String
    },
    error: {
      type: String
    }
  },
  { timestamps: true }
);

AssignmentSchema.index({ createdAt: -1 });
AssignmentSchema.index({ status: 1 });
AssignmentSchema.index({ jobId: 1 });

export const AssignmentModel =
  mongoose.models.Assignment ||
  mongoose.model("Assignment", AssignmentSchema);
