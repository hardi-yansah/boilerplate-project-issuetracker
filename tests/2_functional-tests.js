const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

let testId;

suite("Functional Tests", function () {
  suite("POST /api/issues/{project} => issue object", function () {
    test("Create an issue with every field", function (done) {
      chai
        .request(server)
        .post(`/api/issues/test`)
        .send({
          issue_title: "Test Issue",
          issue_text: "This is a test issue",
          created_by: "Tester",
          assigned_to: "Test User",
          status_text: "Open",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Test Issue");
          assert.equal(res.body.issue_text, "This is a test issue");
          assert.equal(res.body.created_by, "Tester");
          assert.equal(res.body.assigned_to, "Test User");
          assert.equal(res.body.status_text, "Open");
          assert.isTrue(res.body.open);
          testId = res.body._id;
          done();
        });
    });

    test("Create an issue with only required fields", function (done) {
      chai
        .request(server)
        .post(`/api/issues/test`)
        .send({
          issue_title: "Test Issue",
          issue_text: "This is a test issue",
          created_by: "Tester",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Test Issue");
          assert.equal(res.body.issue_text, "This is a test issue");
          assert.equal(res.body.created_by, "Tester");
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          assert.isTrue(res.body.open);
          testId = res.body._id;
          done();
        });
    });

    test("Create an issue with missing required fields", function (done) {
      chai
        .request(server)
        .post(`/api/issues/test`)
        .send({
          issue_title: "Incomplete Issue",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });

  suite("GET /api/issues/{project} => array of issue objects", function () {
    test("View issues on aproject", function (done) {
      chai
        .request(server)
        .get(`/api/issues/test`)
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test("View issues on a project with one filter", function (done) {
      chai
        .request(server)
        .get(`/api/issues/test`)
        .query({ open: true })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach((issue) => {
            assert.isTrue(issue.open);
          });
          done();
        });
    });

    test("View issues on a project with multiple filters", function (done) {
      chai
        .request(server)
        .get(`/api/issues/test`)
        .query({ open: true, created_by: "Tester" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach((issue) => {
            assert.isTrue(issue.open);
            assert.equal(issue.created_by, "Tester");
          });
          done();
        });
    });
  });

  suite("PUT /api/issues/{project} => text", function () {
    test("Update one field on an issue", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: testId,
          issue_title: "Updated Issue Title",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, testId);
          done();
        });
    });

    test("Update multiple fields on an issue", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: testId,
          issue_title: "Updated Title",
          issue_text: "Updated Text",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, testId);
          done();
        });
    });

    test("Update an issue with missing _id", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          issue_title: "Updated Title",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });

    test("Update an issue with no fields to update", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: testId,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "no update field(s) sent");
          assert.equal(res.body._id, testId);
          done();
        });
    });

    test("Update an issue with an invalid _id", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: "invalid-id",
          issue_title: "Should not update",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not update");
          assert.equal(res.body._id, "invalid-id");
          done();
        });
    });
  });

  suite("DELETE /api/issues/{project} => text", function () {
    test("Delete an issue", function (done) {
      chai
        .request(server)
        .delete(`/api/issues/test`)
        .send({
          _id: testId,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully deleted");
          assert.equal(res.body._id, testId);
          done();
        });
    });

    test("Delete an issue with a invalid _id", function (done) {
      chai
        .request(server)
        .delete(`/api/issues/test`)
        .send({
          _id: "invalid",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not delete");
          assert.equal(res.body._id, "invalid");
          done();
        });
    });

    test("Delete an issue with missing _id", function (done) {
      chai
        .request(server)
        .delete(`/api/issues/test`)
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
  });
});
