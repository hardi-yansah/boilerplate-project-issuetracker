"use strict";

module.exports = function (app) {
  let issues = []; // Simulated in-memory database

  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      const project = req.params.project;
      const projectIssues = issues.filter((issue) => issue.project === project);
      res.json(projectIssues);
    })

    .post(function (req, res) {
      const project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to = "",
        status_text = "",
      } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: "required field(s) missing" });
      }

      const newIssue = {
        _id: new Date().valueOf().toString(), // Unique ID
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open: true,
        created_on: new Date(),
        updated_on: new Date(),
        project, // Associate with project
      };

      issues.push(newIssue);
      res.json(newIssue);
    })

    .put(function (req, res) {
      const project = req.params.project;
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;

      if (!_id) {
        return res.json({ error: "missing _id" });
      }

      const updates = {};
      if (issue_title) updates.issue_title = issue_title;
      if (issue_text) updates.issue_text = issue_text;
      if (created_by) updates.created_by = created_by;
      if (assigned_to) updates.assigned_to = assigned_to;
      if (status_text) updates.status_text = status_text;

      if (Object.keys(updates).length === 0) {
        return res.json({ error: "no update field(s) sent", _id: _id });
      }

      const issue = issues.find(
        (issue) => issue._id === _id && issue.project === project
      );
      if (issue) {
        Object.assign(issue, updates);
        issue.updated_on = new Date(); // Update the timestamp
        return res.json({ result: "successfully updated", _id: _id });
      } else {
        return res.json({ error: "could not update", _id: _id });
      }
    })

    .delete(function (req, res) {
      const project = req.params.project;
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: "missing _id" });
      }

      const index = issues.findIndex(
        (issue) => issue._id === _id && issue.project === project
      );
      if (index !== -1) {
        issues.splice(index, 1);
        return res.json({ result: "successfully deleted", _id: _id });
      } else {
        return res.json({ error: "could not delete", _id: _id });
      }
    });
};
