const { default: mongoose } = require("mongoose");

const ClientSchema = new mongoose.Schema(
  {
    clientDetails: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    projectDetails: {
      projectName: {
        type: String,
        required: true,
      },
      projectManagers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProjectManager",
          required: true,
        },
      ],
      projectStartDate: {
        type: Date,
        required: true,
      },
      projectExpectedDeliveryDate: {
        type: Date,
        required: true,
      },
      projectDeliveryDate: {
        type: Date,
        required: true,
      },
    },
    AMC: {
      type: {
        startDate: Date,
        endDate: Date,
      },
    },
    domain: {
      type: {
        name: String,
        id: String,
        password: String,
        startDate: Date,
        endDate: Date,
      },
      required: true,
    },
    hosting: {
      type: {
        name: String,
        id: String,
        password: String,
        startDate: Date,
        endDate: Date,
      },
      required: true,
    },
    socials: {
      type: {
        facebook: {
          id: String,
          password: String,
          url: String,
        },
        instagram: {
          id: String,
          password: String,
          url: String,
        },
        linkedin: {
          id: String,
          password: String,
          url: String,
        },
        twitter: {
          id: String,
          password: String,
          url: String,
        },
        other: {
          name: String,
          id: String,
          password: String,
          url: String,
        },
      },
    },
    files: [
      {
        filename: String,
        path: String,
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
    pricing: {
      type: {
        basePrice: {
          type: Number,
          required: true,
        },
        additionalCosts: {
          type: Number,
          default: 0,
        },
        totalCost: {
          type: Number,
          required: true,
        },
      },
    },
    paid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", ClientSchema);
