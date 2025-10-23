// Frontend/src/Students/Assignments.jsx
import React from "react";
import { FileText, Calendar, User, Clock, AlertCircle } from "lucide-react";
import useManageStore from "../Store/useManageStore";

const Assignments = () => {
  const currentUser = useManageStore((state) => state.currentUser);
  const getAssignments = useManageStore((state) => state.getAssignments);

  const assignments = getAssignments();

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-3xl font-bold">Assignments</h1>
        <p className="text-gray-400 mt-1">View and manage your assignments</p>
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
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <User className="w-4 h-4" />
                          <span>{assignment.adminName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Assigned:{" "}
                            {new Date(
                              assignment.timestamp
                            ).toLocaleDateString()}
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
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{assignment.adminName}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Assigned:{" "}
                          {new Date(assignment.timestamp).toLocaleDateString()}
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
