class AvatarAgent {
  constructor(options = {}) {
    this.name = options.name || "Lamar's Ai Avatar";
    this.overlay = document.getElementById("avatarWidgetOverlay");
    this.video = document.getElementById("avatarVideo");
    this.facePulse = document.getElementById("avatarFacePulse");
    this.messages = document.getElementById("avatarMessages");
    this.input = document.getElementById("avatarInput");
    this.sendBtn = document.getElementById("avatarSend");
    this.micBtn = document.getElementById("avatarMicBtn");
    this.camBtn = document.getElementById("avatarCamBtn");
    this.statusText = document.getElementById("avatarStatusText");
    this.stream = null;
    this.recognition = null;
    this.isListening = false;
    this.endpoint = options.endpoint || "/api/ai-chat";
    this.systemPrompt =
      options.systemPrompt ||
      "You are an elite concierge AI assistant. Speak with clarity, brevity, and confidence.";
  }

  init() {
    const openBtn = document.getElementById("openAvatarWidget");
    const closeBtn = document.getElementById("avatarCloseBtn");
    const minBtn = document.getElementById("avatarMinBtn");

    if (openBtn) openBtn.addEventListener("click", () => this.open());
    if (closeBtn) closeBtn.addEventListener("click", () => this.close());
    if (minBtn) minBtn.addEventListener("click", () => this.close());
    if (this.overlay) {
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) this.close();
      });
    }

    if (this.sendBtn) {
      this.sendBtn.addEventListener("click", () => this.handleSend());
    }
    if (this.input) {
      this.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.handleSend();
      });
    }
    if (this.micBtn) this.micBtn.addEventListener("click", () => this.toggleMic());
    if (this.camBtn) this.camBtn.addEventListener("click", () => this.toggleCam());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  }

  open() {
    if (!this.overlay) return;
    this.overlay.classList.add("open");
    this.addMessage(
      "ai",
      "Welcome. I am online and ready. Enable mic or type your request to begin."
    );
  }

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove("open");
    this.stopMic();
    this.stopCam();
  }

  addMessage(role, text) {
    if (!this.messages || !text) return;
    const alreadyGreeting =
      role === "ai" &&
      text.startsWith("Welcome.") &&
      this.messages.querySelector('[data-greeting="1"]');
    if (alreadyGreeting) return;

    const item = document.createElement("div");
    item.className = `avatar-message ${role}`;
    if (role === "ai" && text.startsWith("Welcome.")) item.dataset.greeting = "1";
    item.textContent = text;
    this.messages.appendChild(item);
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  async handleSend() {
    const text = this.input?.value?.trim();
    if (!text) return;
    this.input.value = "";
    this.addMessage("user", text);
    const reply = await this.getAIReply(text);
    this.addMessage("ai", reply);
    this.speak(reply);
  }

  async getAIReply(userMessage) {
    if (this.endpoint) {
      try {
        const chatHistory = Array.from(
          this.messages?.querySelectorAll(".avatar-message") || []
        ).map((node) => ({
          role: node.classList.contains("user") ? "user" : "assistant",
          content: node.textContent || "",
        }));

        const res = await fetch(this.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system: this.systemPrompt,
            messages: [...chatHistory, { role: "user", content: userMessage }],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.reply) return data.reply;
        }
      } catch (_) {
        // fall back to local brain
      }
    }
    return this.localBrain(userMessage);
  }

  localBrain(message) {
    const lower = message.toLowerCase();
    if (lower.includes("price") || lower.includes("cost")) {
      return "We scope pricing after a quick assessment. Share dimensions, material preference, and timeline, and I will prepare a precise estimate path.";
    }
    if (lower.includes("book") || lower.includes("appointment")) {
      return "Great. I recommend booking a consultation through the contact page. Bring photos in natural light and any reference materials.";
    }
    if (lower.includes("material") || lower.includes("leather")) {
      return "Our premium options include full-grain leather, performance velvet, and contract textiles. I can help narrow choices by durability, feel, and lighting.";
    }
    return "Understood. I can help with consultations, material selection, project timelines, and restoration planning. Tell me what piece you are restoring.";
  }

  speak(text) {
    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.98;
    utter.pitch = 0.95;
    utter.onstart = () => this.facePulse?.classList.add("speaking");
    utter.onend = () => this.facePulse?.classList.remove("speaking");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  async toggleCam() {
    if (this.stream) return this.stopCam();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (this.video) {
        this.video.srcObject = this.stream;
        await this.video.play();
      }
      this.camBtn?.classList.add("active");
      this.setStatus("Camera enabled");
    } catch (e) {
      this.addMessage("ai", "Camera permission was blocked. Please allow camera access.");
    }
  }

  stopCam() {
    if (!this.stream) return;
    this.stream.getTracks().forEach((t) => t.stop());
    this.stream = null;
    if (this.video) this.video.srcObject = null;
    this.camBtn?.classList.remove("active");
    this.setStatus("Online");
  }

  toggleMic() {
    if (this.isListening) return this.stopMic();
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) {
      this.addMessage("ai", "Speech recognition is not supported in this browser.");
      return;
    }
    this.recognition = new Rec();
    this.recognition.lang = "en-US";
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
    this.recognition.onresult = async (event) => {
      const spoken = event.results[0][0].transcript;
      this.addMessage("user", spoken);
      const reply = await this.getAIReply(spoken);
      this.addMessage("ai", reply);
      this.speak(reply);
    };
    this.recognition.onend = () => {
      this.isListening = false;
      this.micBtn?.classList.remove("active");
      this.setStatus("Online");
    };
    this.recognition.start();
    this.isListening = true;
    this.micBtn?.classList.add("active");
    this.setStatus("Listening");
  }

  stopMic() {
    if (this.recognition && this.isListening) this.recognition.stop();
    this.isListening = false;
    this.micBtn?.classList.remove("active");
    this.setStatus("Online");
  }

  setStatus(text) {
    if (this.statusText) this.statusText.textContent = text;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const agent = new AvatarAgent();
  agent.init();
});
