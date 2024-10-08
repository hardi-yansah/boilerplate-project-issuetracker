"use strict";

const issues = {};

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
      const query = req.query;

      const projectIssues = issues[project] || [];

      const filteredIssues = projectIssues.filter((issue) => {
        return Object.keys(query).every((key) => issue[key] == query[key]);
      });

      res.json(filteredIssues);
    })

    .post(function (req, res) {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: "Required field(s) missing" });
      }

      const id = new Date().getTime().toString();
      const newIssue = {
        _id: id,
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || "",
        status_text: status_text || "",
        created_on: new Date(),
        updated_on: new Date(),
        open: true,
      };

      if (!issues[project]) {
        issues[project] = [];
      }
      issues[project].push(newIssue);
      res.json(newIssue);
    })

    .put(function (req, res) {
      let project = req.params.project;
      const { _id, ...updates } = req.body;

      if (!_id) {
        return res.json({ error: "Missing _id" });
      }

      const projectIssues = issues[project] || [];
      const issue = projectIssues.find((issue) => issue._id === _id);

      if (!issue) {
        return res.json({ error: "Could not update", _id });
      }

      // If no fields to update
      if (Object.keys(updates).length === 0) {
        return res.json({ error: "No updates provided", _id }); // Ensure _id is sent back
      }

      // Update issue fields and set updated date
      Object.keys(updates).forEach((key) => {
        if (updates[key] !== "") issue[key] = updates[key];
      });
      issue.updated_on = new Date();

      res.json({ result: "Successfully update", _id });
    })

    .delete(function (req, res) {
      let project = req.params.project;
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: "Missing _id" });
      }

      const projectIssues = issues[project] || [];
      const index = projectIssues.findIndex((issue) => issue._id === _id);

      if (index === -1) {
        return res.json({ error: "Could not delete", _id });
      }

      projectIssues.splice(index, 1);

      res.json({ result: "Successfully deleted", _id });
    });
};
