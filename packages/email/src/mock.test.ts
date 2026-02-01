import { beforeEach, describe, expect, it } from "vitest";
import { createMockEmailTransport, mockEmailTransport } from "./mock";

describe("mockEmailTransport", () => {
  beforeEach(() => {
    mockEmailTransport.clear();
  });

  it("captures sent emails", async () => {
    const result = await mockEmailTransport.send({
      from: "noreply@example.com",
      to: "user@example.com",
      subject: "Welcome",
      html: "<p>Hello!</p>",
    });

    expect(result.success).toBe(true);
    expect(result.id).toMatch(/^mock-\d+-\d+$/);
    expect(mockEmailTransport.sentEmails).toHaveLength(1);
    expect(mockEmailTransport.sentEmails[0].to).toBe("user@example.com");
    expect(mockEmailTransport.sentEmails[0].subject).toBe("Welcome");
  });

  it("clears stored emails", async () => {
    await mockEmailTransport.send({
      from: "noreply@example.com",
      to: "user@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });

    expect(mockEmailTransport.sentEmails).toHaveLength(1);
    mockEmailTransport.clear();
    expect(mockEmailTransport.sentEmails).toHaveLength(0);
  });

  it("finds emails by recipient", async () => {
    await mockEmailTransport.send({
      from: "noreply@example.com",
      to: "alice@example.com",
      subject: "For Alice",
      html: "<p>Hi Alice</p>",
    });
    await mockEmailTransport.send({
      from: "noreply@example.com",
      to: "bob@example.com",
      subject: "For Bob",
      html: "<p>Hi Bob</p>",
    });
    await mockEmailTransport.send({
      from: "noreply@example.com",
      to: ["alice@example.com", "charlie@example.com"],
      subject: "Group",
      html: "<p>Hi all</p>",
    });

    const aliceEmails = mockEmailTransport.getEmailsTo("alice@example.com");
    expect(aliceEmails).toHaveLength(2);
    expect(aliceEmails[0].subject).toBe("For Alice");
    expect(aliceEmails[1].subject).toBe("Group");

    const bobEmails = mockEmailTransport.getEmailsTo("bob@example.com");
    expect(bobEmails).toHaveLength(1);
  });

  it("gets the last sent email", async () => {
    await mockEmailTransport.send({
      from: "noreply@example.com",
      to: "user@example.com",
      subject: "First",
      html: "<p>1</p>",
    });
    await mockEmailTransport.send({
      from: "noreply@example.com",
      to: "user@example.com",
      subject: "Second",
      html: "<p>2</p>",
    });

    const last = mockEmailTransport.getLastEmail();
    expect(last?.subject).toBe("Second");
  });

  it("returns undefined for getLastEmail when empty", () => {
    expect(mockEmailTransport.getLastEmail()).toBeUndefined();
  });
});

describe("createMockEmailTransport", () => {
  it("creates independent instances", async () => {
    const transport1 = createMockEmailTransport();
    const transport2 = createMockEmailTransport();

    await transport1.send({
      from: "noreply@example.com",
      to: "user@example.com",
      subject: "Transport 1",
      html: "<p>1</p>",
    });

    expect(transport1.sentEmails).toHaveLength(1);
    expect(transport2.sentEmails).toHaveLength(0);
  });
});
