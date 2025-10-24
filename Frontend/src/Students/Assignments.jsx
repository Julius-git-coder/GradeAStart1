

import React, { useState, useEffect } from "react";
import { FileText, Calendar, User, Clock, AlertCircle } from "lucide-react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../Service/FirebaseConfig";
import { useAuth } from "../Store/useManageStore";

const Assignments = () => {
  const { userData } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.teamId) {
      setLoading(false);
      return;
    }

    // Real-time listener for assignments
    const assignmentsQuery = query(
      collection(db, "assignments"),
      where("teamId", "==", userData.teamId),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      assignmentsQuery,
      (snapshot) => {
        const assignmentList = [];
        snapshot.forEach((doc) => {
          assignmentList.push({ id: doc.id, ...doc.data() });
        });
        setAssignments(assignmentList);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading assignments:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData?.teamId]);

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const activeAssignments = assignments.filter((a) => !isOverdue(a.dueDate));
  const overdueAssignments = assignments.filter((a) => isOverdue(a.dueDate));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-3xl font-bold">Assignments</h1>
        <p className="text-gray-400 mt-1">View and manage your assignments</p>
      </div>

      {/* Real-time Indicator */}
      <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4 flex items-center space-x-3">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </div>
        <p className="text-green-500 text-sm font-medium">
          Real-time updates enabled - New assignments appear automatically
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Assignments</p>
              <p className="text-white text-3xl font-bold mt-1">
                {assignments.length}
              </p>
            </div>
            <FileText className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-white text-3xl font-bold mt-1">
                {activeAssignments.length}
              </p>
            </div>
            <Clock className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Overdue</p>
              <p className="text-white text-3xl font-bold mt-1">
                {overdueAssignments.length}
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Active Assignments */}
      {activeAssignments.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-white text-xl font-bold">Active Assignments</h2>
          </div>

          <div className="divide-y divide-gray-700">
            {activeAssignments.map((assignment) => {
              const daysUntil = getDaysUntilDue(assignment.dueDate);
              return (
                <div
                  key={assignment.id}
                  className="p-6 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-white text-lg font-semibold">
                          {assignment.title}
                        </h3>
                        {daysUntil <= 2 && (
                          <span className="bg-yellow-500 bg-opacity-20 text-yellow-500 text-xs font-semibold px-3 py-1 rounded-full">
                            Due Soon
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 mb-4 leading-relaxed">
                        {assignment.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm flex-wrap gap-2">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Assigned:{" "}
                            {assignment.createdAt?.toDate
                              ? new Date(assignment.createdAt.toDate()).toLocaleDateString()
                              : "Recently"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-500">
                          <Clock className="w-4 h-4" />
                          <span>
                            Due:{" "}
                            {new Date(assignment.dueDate).toLocaleDateString()}{" "}
                            ({daysUntil} {daysUntil === 1 ? "day" : "days"}{" "}
                            left)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overdue Assignments */}
      {overdueAssignments.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-red-500">
          <div className="p-6 border-b border-red-500 bg-red-500 bg-opacity-10">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h2 className="text-white text-xl font-bold">
                Overdue Assignments
              </h2>
            </div>
          </div>

          <div className="divide-y divide-gray-700">
            {overdueAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="p-6 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-white text-lg font-semibold">
                        {assignment.title}
                      </h3>
                      <span className="bg-red-500 bg-opacity-20 text-red-500 text-xs font-semibold px-3 py-1 rounded-full">
                        Overdue
                      </span>
                    </div>
                    <p className="text-gray-400 mb-4 leading-relaxed">
                      {assignment.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm flex-wrap gap-2">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Assigned:{" "}
                          {assignment.createdAt?.toDate
                            ? new Date(assignment.createdAt.toDate()).toLocaleDateString()
                            : "Recently"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-red-500">
                        <Clock className="w-4 h-4" />
                        <span>
                          Was due:{" "}
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Assignments */}
      {assignments.length === 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No assignments yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Check back later for new assignments from your admin
          </p>
        </div>
      )}
    </div>
  );
};

export default Assignments;