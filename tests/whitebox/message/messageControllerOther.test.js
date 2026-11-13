import { jest } from "@jest/globals";

const mockMessageFindById = jest.fn();
const mockMessageCreate = jest.fn();
const mockMessageCountDocuments = jest.fn();
const mockConversationFindById = jest.fn();
const mockCloudinaryUpload = jest.fn();
const mockCloudinaryDestroy = jest.fn();
const mockTranslateText = jest.fn();
const mockUploadFileToDrive = jest.fn();
const mockExistsSync = jest.fn();
const mockUnlinkSync = jest.fn();
const mockHandleAIResponse = jest.fn();

jest.unstable_mockModule("../../../backend/src/models/Conversation.js", () => ({
  default: {
    findById: mockConversationFindById,
  },
}));

jest.unstable_mockModule("../../../backend/src/models/Message.js", () => ({
  default: {
    findById: mockMessageFindById,
    create: mockMessageCreate,
    countDocuments: mockMessageCountDocuments,
  },
}));

jest.unstable_mockModule("../../../backend/src/libs/cloudinary.js", () => ({
  default: {
    uploader: {
      upload: mockCloudinaryUpload,
      destroy: mockCloudinaryDestroy,
    },
  },
}));

jest.unstable_mockModule("../../../backend/src/services/aiService.js", () => ({
  handleAIResponse: mockHandleAIResponse,
}));

jest.unstable_mockModule("../../../backend/src/services/translateService.js", () => ({
  translateText: mockTranslateText,
}));

jest.unstable_mockModule("../../../backend/src/services/driveService.js", () => ({
  uploadFileToDrive: mockUploadFileToDrive,
}));

jest.unstable_mockModule("../../../backend/src/utils/messageHelper.js", () => ({
  updateConversationAfterCreateMessage: jest.fn().mockResolvedValue(undefined),
}));

jest.unstable_mockModule("mongoose", () => ({
  default: { Types: { ObjectId: jest.fn((value) => value) } },
}));

jest.unstable_mockModule("fs", () => ({
  default: {
    existsSync: mockExistsSync,
    unlinkSync: mockUnlinkSync,
  },
}));

const {
  sendGroupMessage,
  uploadAudio,
  uploadImage,
  reactToMessage,
  pinMessage,
  markMediaAsViewed,
  recallMessage,
  voteOnPoll,
  translateMessage,
  uploadFile,
  editMessage,
  deleteMessageForMe,
} = await import("../../../backend/src/controllers/messageController.js");

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function makeConversation(overrides = {}) {
  return {
    _id: "conversation-1",
    type: "group",
    participants: [{ userId: "user-1" }, { userId: "user-2", role: "admin" }],
    save: jest.fn().mockResolvedValue(undefined),
    lastMessage: null,
    ...overrides,
  };
}

function makeMessage(overrides = {}) {
  return {
    _id: "message-1",
    conversationId: "conversation-1",
    senderId: "user-1",
    content: "Message",
    reactions: [],
    viewedBy: [],
    deletedFor: [],
    editHistory: [],
    isPinned: false,
    isRecalled: false,
    isViewOnce: false,
    expiresIn: null,
    poll: null,
    save: jest.fn().mockResolvedValue(undefined),
    populate: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeReq(overrides = {}) {
  return {
    params: { messageId: "message-1" },
    body: {},
    user: { _id: "user-1" },
    app: { get: jest.fn().mockReturnValue(null) },
    ...overrides,
  };
}

function makeIo() {
  const emit = jest.fn();
  return { io: { to: jest.fn().mockReturnValue({ emit }) }, emit };
}

describe("messageController endpoints other than sendDirectMessage", () => {
  let logError;
  let logWarn;

  beforeEach(() => {
    jest.clearAllMocks();
    mockExistsSync.mockReturnValue(false);
    mockCloudinaryUpload.mockResolvedValue({ secure_url: "https://cdn.test/file" });
    mockCloudinaryDestroy.mockResolvedValue({ result: "ok" });
    mockUploadFileToDrive.mockResolvedValue({
      fileUrl: "https://drive.test/file",
      fileName: "report.pdf",
      fileSize: 10,
    });
    mockTranslateText.mockResolvedValue("Translated");
    logError = jest.spyOn(console, "error").mockImplementation(() => {});
    logWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    logError.mockRestore();
    logWarn.mockRestore();
  });

  describe("sendGroupMessage", () => {
    it("rejects a request without content or attachments", async () => {
      const req = makeReq({ conversation: makeConversation() });
      const res = makeRes();

      await sendGroupMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("allows channel administrators and emits the created message", async () => {
      const conversation = makeConversation({
        type: "channel",
        participants: [{ userId: "user-1", role: "admin" }, { userId: "user-2" }],
        unreadCounts: new Map(),
      });
      const { io, emit } = makeIo();
      const req = makeReq({
        body: { conversationId: conversation._id, content: "Hello" },
        conversation,
        app: { get: jest.fn().mockReturnValue(io) },
      });
      mockMessageCreate.mockResolvedValue(makeMessage());
      const res = makeRes();

      await sendGroupMessage(req, res);

      expect(mockMessageCreate).toHaveBeenCalled();
      expect(emit).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("populates shared contacts and triggers AI from a mention ID", async () => {
      const conversation = makeConversation();
      const message = makeMessage();
      mockMessageCreate.mockResolvedValueOnce(message);
      const req = makeReq({
        body: {
          content: "Question",
          mentions: ["000000000000000000000000"],
          sharedContactId: "contact-1",
        },
        conversation,
      });
      const res = makeRes();

      await sendGroupMessage(req, res);

      expect(message.populate).toHaveBeenCalledWith(
        "sharedContact",
        "_id displayName username avatarUrl"
      );
      expect(mockHandleAIResponse).toHaveBeenCalledWith(conversation._id, null, "user-1");
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("denies channel members and returns 500 when message creation fails", async () => {
      const conversation = makeConversation({
        type: "channel",
        participants: [{ userId: "user-1", role: "member" }],
      });
      const deniedRes = makeRes();
      await sendGroupMessage(
        makeReq({ body: { content: "Hello" }, conversation }),
        deniedRes
      );
      expect(deniedRes.status).toHaveBeenCalledWith(403);

      mockMessageCreate.mockRejectedValueOnce(new Error("db unavailable"));
      const errorRes = makeRes();
      await sendGroupMessage(
        makeReq({ body: { content: "Hello" }, conversation: makeConversation() }),
        errorRes
      );
      expect(errorRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe.each([
    ["uploadAudio", uploadAudio, "audioUrl", "nexuschat_audio", "video"],
    ["uploadImage", uploadImage, "imgUrl", "nexuschat_images", "image"],
  ])("%s", (_name, handler, responseField, folder, resourceType) => {
    it("rejects a missing upload and returns the uploaded URL on success", async () => {
      const missingRes = makeRes();
      await handler(makeReq(), missingRes);
      expect(missingRes.status).toHaveBeenCalledWith(400);

      const req = makeReq({ file: { path: "upload.tmp" } });
      const res = makeRes();
      await handler(req, res);
      expect(mockCloudinaryUpload).toHaveBeenCalledWith("upload.tmp", {
        folder,
        resource_type: resourceType,
      });
      expect(mockUnlinkSync).toHaveBeenCalledWith("upload.tmp");
      expect(res.json).toHaveBeenCalledWith({ [responseField]: "https://cdn.test/file" });
    });

    it("returns 500 and removes a temporary file when cloud upload fails", async () => {
      mockCloudinaryUpload.mockRejectedValueOnce(new Error("upload failed"));
      const req = makeReq({ file: { path: "upload.tmp" } });
      const res = makeRes();

      await handler(req, res);

      expect(mockUnlinkSync).toHaveBeenCalledWith("upload.tmp");
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("reactToMessage", () => {
    it("rejects missing emoji and missing message", async () => {
      const noEmoji = makeRes();
      await reactToMessage(makeReq(), noEmoji);
      expect(noEmoji.status).toHaveBeenCalledWith(400);

      mockMessageFindById.mockResolvedValueOnce(null);
      const notFound = makeRes();
      await reactToMessage(makeReq({ body: { emoji: "👍" } }), notFound);
      expect(notFound.status).toHaveBeenCalledWith(404);
    });

    it.each([
      ["removes the same reaction", [{ userId: "user-1", emoji: "👍" }], "👍", 0],
      ["changes an existing reaction", [{ userId: "user-1", emoji: "👍" }], "❤️", 1],
      ["adds a new reaction", [], "🎉", 1],
    ])("%s", async (_label, reactions, emoji, expectedLength) => {
      const message = makeMessage({ reactions });
      mockMessageFindById.mockResolvedValueOnce(message);
      mockConversationFindById.mockResolvedValueOnce(makeConversation());
      const { io, emit } = makeIo();
      const res = makeRes();

      await reactToMessage(
        makeReq({ body: { emoji }, app: { get: jest.fn().mockReturnValue(io) } }),
        res
      );

      expect(message.reactions).toHaveLength(expectedLength);
      expect(message.save).toHaveBeenCalled();
      expect(emit).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("completes without a conversation and catches model errors", async () => {
      mockMessageFindById.mockResolvedValueOnce(makeMessage());
      mockConversationFindById.mockResolvedValueOnce(null);
      const res = makeRes();
      await reactToMessage(makeReq({ body: { emoji: "👍" } }), res);
      expect(res.status).toHaveBeenCalledWith(200);

      mockMessageFindById.mockRejectedValueOnce(new Error("db unavailable"));
      const errorRes = makeRes();
      await reactToMessage(makeReq({ body: { emoji: "👍" } }), errorRes);
      expect(errorRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("pinMessage", () => {
    it("returns not-found and denies channel members", async () => {
      mockMessageFindById.mockResolvedValueOnce(null);
      const notFound = makeRes();
      await pinMessage(makeReq(), notFound);
      expect(notFound.status).toHaveBeenCalledWith(404);

      mockMessageFindById.mockResolvedValueOnce(makeMessage());
      mockConversationFindById.mockResolvedValueOnce(
        makeConversation({ type: "channel", participants: [{ userId: "user-1", role: "member" }] })
      );
      const denied = makeRes();
      await pinMessage(makeReq(), denied);
      expect(denied.status).toHaveBeenCalledWith(403);
    });

    it("enforces the pin limit and toggles an existing pin off", async () => {
      mockMessageFindById.mockResolvedValueOnce(makeMessage());
      mockConversationFindById.mockResolvedValueOnce(makeConversation());
      mockMessageCountDocuments.mockResolvedValueOnce(3);
      const limitRes = makeRes();
      await pinMessage(makeReq(), limitRes);
      expect(limitRes.status).toHaveBeenCalledWith(400);

      const message = makeMessage({ isPinned: true });
      mockMessageFindById.mockResolvedValueOnce(message);
      mockConversationFindById.mockResolvedValueOnce(makeConversation());
      const { io, emit } = makeIo();
      const res = makeRes();
      await pinMessage(makeReq({ app: { get: jest.fn().mockReturnValue(io) } }), res);
      expect(message.isPinned).toBe(false);
      expect(mockMessageCountDocuments).toHaveBeenCalledTimes(1);
      expect(emit).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("pins a new message below the limit and catches failures", async () => {
      const message = makeMessage();
      mockMessageFindById.mockResolvedValueOnce(message);
      mockConversationFindById.mockResolvedValueOnce(null);
      mockMessageCountDocuments.mockResolvedValueOnce(2);
      const res = makeRes();
      await pinMessage(makeReq(), res);
      expect(message.isPinned).toBe(true);
      expect(res.status).toHaveBeenCalledWith(200);

      mockMessageFindById.mockRejectedValueOnce(new Error("db unavailable"));
      const errorRes = makeRes();
      await pinMessage(makeReq(), errorRes);
      expect(errorRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("markMediaAsViewed", () => {
    it("rejects missing messages and media not marked view-once", async () => {
      mockMessageFindById.mockResolvedValueOnce(null);
      const notFound = makeRes();
      await markMediaAsViewed(makeReq(), notFound);
      expect(notFound.status).toHaveBeenCalledWith(404);

      mockMessageFindById.mockResolvedValueOnce(makeMessage());
      const notViewOnce = makeRes();
      await markMediaAsViewed(makeReq(), notViewOnce);
      expect(notViewOnce.status).toHaveBeenCalledWith(400);
    });

    it("records the first view and emits an update", async () => {
      const message = makeMessage({ isViewOnce: true });
      mockMessageFindById.mockResolvedValueOnce(message);
      mockConversationFindById.mockResolvedValueOnce(makeConversation());
      const { io, emit } = makeIo();
      const res = makeRes();

      await markMediaAsViewed(makeReq({ app: { get: jest.fn().mockReturnValue(io) } }), res);

      expect(message.viewedBy).toContain("user-1");
      expect(message.save).toHaveBeenCalled();
      expect(emit).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("does not save a repeated view and catches lookup errors", async () => {
      const message = makeMessage({ isViewOnce: true, viewedBy: ["user-1"] });
      mockMessageFindById.mockResolvedValueOnce(message);
      mockConversationFindById.mockResolvedValueOnce(null);
      const res = makeRes();
      await markMediaAsViewed(makeReq(), res);
      expect(message.save).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);

      mockMessageFindById.mockRejectedValueOnce(new Error("db unavailable"));
      const errorRes = makeRes();
      await markMediaAsViewed(makeReq(), errorRes);
      expect(errorRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("recallMessage", () => {
    it("rejects missing messages, other users' messages, and already recalled messages", async () => {
      mockMessageFindById.mockResolvedValueOnce(null);
      const missing = makeRes();
      await recallMessage(makeReq(), missing);
      expect(missing.status).toHaveBeenCalledWith(404);

      mockMessageFindById.mockResolvedValueOnce(makeMessage({ senderId: "other-user" }));
      const forbidden = makeRes();
      await recallMessage(makeReq(), forbidden);
      expect(forbidden.status).toHaveBeenCalledWith(403);

      mockMessageFindById.mockResolvedValueOnce(makeMessage({ isRecalled: true }));
      const recalled = makeRes();
      await recallMessage(makeReq(), recalled);
      expect(recalled.status).toHaveBeenCalledWith(400);
    });

    it("removes media/game data, updates last message, and broadcasts", async () => {
      const message = makeMessage({
        imgUrl: "https://cdn.test/nexuschat_images/image-id.png",
        audioUrl: "https://cdn.test/nexuschat_audio/audio-id.mp3",
      });
      const conversation = makeConversation({
        lastMessage: { _id: "message-1", content: "Message" },
      });
      mockMessageFindById.mockResolvedValueOnce(message);
      mockConversationFindById.mockResolvedValueOnce(conversation);
      const { io, emit } = makeIo();
      const res = makeRes();

      await recallMessage(makeReq({ app: { get: jest.fn().mockReturnValue(io) } }), res);

      expect(mockCloudinaryDestroy).toHaveBeenCalledTimes(2);
      expect(message.isRecalled).toBe(true);
      expect(conversation.lastMessage.content).toBe("Tin nhắn đã bị thu hồi");
      expect(conversation.save).toHaveBeenCalled();
      expect(emit).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("completes without a conversation and catches failures", async () => {
      mockMessageFindById.mockResolvedValueOnce(makeMessage());
      mockConversationFindById.mockResolvedValueOnce(null);
      const res = makeRes();
      await recallMessage(makeReq(), res);
      expect(res.status).toHaveBeenCalledWith(200);

      mockMessageFindById.mockRejectedValueOnce(new Error("db unavailable"));
      const errorRes = makeRes();
      await recallMessage(makeReq(), errorRes);
      expect(errorRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("voteOnPoll", () => {
    it("rejects missing option, missing poll, and out-of-range options", async () => {
      const noOption = makeRes();
      await voteOnPoll(makeReq(), noOption);
      expect(noOption.status).toHaveBeenCalledWith(400);

      mockMessageFindById.mockResolvedValueOnce(null);
      const missing = makeRes();
      await voteOnPoll(makeReq({ body: { optionIndex: 0 } }), missing);
      expect(missing.status).toHaveBeenCalledWith(404);

      mockMessageFindById.mockResolvedValueOnce(makeMessage({ poll: { options: [{}] } }));
      const invalid = makeRes();
      await voteOnPoll(makeReq({ body: { optionIndex: 1 } }), invalid);
      expect(invalid.status).toHaveBeenCalledWith(400);
    });

    it("enforces single-choice votes, toggles the selected vote, and broadcasts", async () => {
      const message = makeMessage({
        poll: {
          allowMultiple: false,
          options: [
            { votes: ["user-1", "user-2"] },
            { votes: ["user-1"] },
          ],
        },
      });
      mockMessageFindById.mockResolvedValueOnce(message);
      mockConversationFindById.mockResolvedValueOnce(makeConversation());
      const { io, emit } = makeIo();
      const res = makeRes();

      await voteOnPoll(makeReq({
        body: { optionIndex: 0 },
        app: { get: jest.fn().mockReturnValue(io) },
      }), res);

      expect(message.poll.options[0].votes).toEqual(["user-2"]);
      expect(message.poll.options[1].votes).toEqual([]);
      expect(emit).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("adds a multiple-choice vote and catches failures", async () => {
      const message = makeMessage({
        poll: { allowMultiple: true, options: [{ votes: [] }] },
      });
      mockMessageFindById.mockResolvedValueOnce(message);
      mockConversationFindById.mockResolvedValueOnce(null);
      const res = makeRes();
      await voteOnPoll(makeReq({ body: { optionIndex: 0 } }), res);
      expect(message.poll.options[0].votes).toEqual(["user-1"]);
      expect(res.status).toHaveBeenCalledWith(200);

      mockMessageFindById.mockRejectedValueOnce(new Error("db unavailable"));
      const errorRes = makeRes();
      await voteOnPoll(makeReq({ body: { optionIndex: 0 } }), errorRes);
      expect(errorRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("translateMessage", () => {
    it("rejects missing messages and content, then translates with the requested language", async () => {
      mockMessageFindById.mockResolvedValueOnce(null);
      const missing = makeRes();
      await translateMessage(makeReq(), missing);
      expect(missing.status).toHaveBeenCalledWith(404);

      mockMessageFindById.mockResolvedValueOnce(makeMessage({ content: "" }));
      const noContent = makeRes();
      await translateMessage(makeReq(), noContent);
      expect(noContent.status).toHaveBeenCalledWith(400);

      mockMessageFindById.mockResolvedValueOnce(makeMessage({ content: "Hello" }));
      const res = makeRes();
      await translateMessage(makeReq({ body: { targetLang: "fr" } }), res);
      expect(mockTranslateText).toHaveBeenCalledWith("Hello", "fr");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("uses the default language and returns translation errors", async () => {
      mockMessageFindById.mockResolvedValueOnce(makeMessage({ content: "Hello" }));
      const success = makeRes();
      await translateMessage(makeReq(), success);
      expect(mockTranslateText).toHaveBeenCalledWith("Hello", "vi");

      mockMessageFindById.mockRejectedValueOnce(new Error("translation failed"));
      const failure = makeRes();
      await translateMessage(makeReq(), failure);
      expect(failure.status).toHaveBeenCalledWith(500);
      expect(failure.json).toHaveBeenCalledWith({ message: "translation failed" });
    });
  });

  describe("uploadFile", () => {
    it("rejects missing files and returns Google Drive results", async () => {
      const missing = makeRes();
      await uploadFile(makeReq(), missing);
      expect(missing.status).toHaveBeenCalledWith(400);

      const file = { path: "upload.tmp", originalname: "report.pdf", size: 10 };
      const res = makeRes();
      await uploadFile(makeReq({ file }), res);
      expect(mockUploadFileToDrive).toHaveBeenCalledWith(file);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ fileUrl: "https://drive.test/file" }));
    });

    it("falls back to Cloudinary and cleans up the temporary file", async () => {
      mockUploadFileToDrive.mockRejectedValueOnce(new Error("drive unavailable"));
      mockExistsSync.mockReturnValue(true);
      const req = makeReq({
        file: { path: "upload.tmp", originalname: "report.pdf", size: 10 },
      });
      const res = makeRes();

      await uploadFile(req, res);

      expect(mockCloudinaryUpload).toHaveBeenCalledWith("upload.tmp", {
        folder: "nexuschat_files",
        resource_type: "raw",
      });
      expect(mockUnlinkSync).toHaveBeenCalledWith("upload.tmp");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 500 and cleans up after an upload failure", async () => {
      mockUploadFileToDrive.mockRejectedValueOnce(new Error("drive unavailable"));
      mockCloudinaryUpload.mockRejectedValueOnce(new Error("cloud unavailable"));
      mockExistsSync.mockReturnValue(true);
      const res = makeRes();
      await uploadFile(makeReq({ file: { path: "upload.tmp" } }), res);
      expect(mockUnlinkSync).toHaveBeenCalledWith("upload.tmp");
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("editMessage", () => {
    it("rejects missing content, missing messages, and non-owners", async () => {
      const noContent = makeRes();
      await editMessage(makeReq(), noContent);
      expect(noContent.status).toHaveBeenCalledWith(400);

      mockMessageFindById.mockResolvedValueOnce(null);
      const missing = makeRes();
      await editMessage(makeReq({ body: { content: "Edit" } }), missing);
      expect(missing.status).toHaveBeenCalledWith(404);

      mockMessageFindById.mockResolvedValueOnce(makeMessage({ senderId: "other-user" }));
      const forbidden = makeRes();
      await editMessage(makeReq({ body: { content: "Edit" } }), forbidden);
      expect(forbidden.status).toHaveBeenCalledWith(403);
    });

    it.each([
      ["recalled", { isRecalled: true }],
      ["expiring", { expiresIn: 30 }],
      ["view-once", { isViewOnce: true }],
    ])("rejects a %s message", async (_name, messageFields) => {
      mockMessageFindById.mockResolvedValueOnce(makeMessage(messageFields));
      const res = makeRes();
      await editMessage(makeReq({ body: { content: "Edit" } }), res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("updates edit history and the matching conversation preview", async () => {
      const message = makeMessage();
      const conversation = makeConversation({
        lastMessage: { _id: "message-1", content: "Message" },
      });
      mockMessageFindById.mockResolvedValueOnce(message);
      mockConversationFindById.mockResolvedValueOnce(conversation);
      const { io, emit } = makeIo();
      const res = makeRes();

      await editMessage(makeReq({
        body: { content: "Edited" },
        app: { get: jest.fn().mockReturnValue(io) },
      }), res);

      expect(message.editHistory).toHaveLength(1);
      expect(message.content).toBe("Edited");
      expect(message.isEdited).toBe(true);
      expect(conversation.lastMessage.content).toBe("Edited");
      expect(conversation.save).toHaveBeenCalled();
      expect(emit).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("handles absent conversations and reports save failures", async () => {
      mockMessageFindById.mockResolvedValueOnce(makeMessage());
      mockConversationFindById.mockResolvedValueOnce(null);
      const success = makeRes();
      await editMessage(makeReq({ body: { content: "Edited" } }), success);
      expect(success.status).toHaveBeenCalledWith(200);

      mockMessageFindById.mockRejectedValueOnce(new Error("db unavailable"));
      const failure = makeRes();
      await editMessage(makeReq({ body: { content: "Edited" } }), failure);
      expect(failure.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteMessageForMe", () => {
    it("returns not-found and adds the user's deletion marker", async () => {
      mockMessageFindById.mockResolvedValueOnce(null);
      const missing = makeRes();
      await deleteMessageForMe(makeReq(), missing);
      expect(missing.status).toHaveBeenCalledWith(404);

      const message = makeMessage({ deletedFor: null });
      mockMessageFindById.mockResolvedValueOnce(message);
      const res = makeRes();
      await deleteMessageForMe(makeReq(), res);
      expect(message.deletedFor).toEqual(["user-1"]);
      expect(message.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("does not duplicate a deletion marker and catches database errors", async () => {
      const message = makeMessage({ deletedFor: ["user-1"] });
      mockMessageFindById.mockResolvedValueOnce(message);
      const success = makeRes();
      await deleteMessageForMe(makeReq(), success);
      expect(message.save).not.toHaveBeenCalled();

      mockMessageFindById.mockRejectedValueOnce(new Error("db unavailable"));
      const failure = makeRes();
      await deleteMessageForMe(makeReq(), failure);
      expect(failure.status).toHaveBeenCalledWith(500);
    });
  });
});
