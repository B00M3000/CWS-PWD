/*
 * Created on Fri Oct 13 2023
 *
 * Copyright (c) 2023 Thomas Zhou
 */

import { AccessLevel, AccountType } from "@/lib/enums";
import { ImageSchema } from "@/server/mongo/schemas/image";
import { ProjectSchema } from "@/server/mongo/schemas/project";
import { UserSchema } from "@/server/mongo/schemas/user";
import { json } from "@sveltejs/kit";

export async function load({ locals }){
    const returnObject: any = {}

    if(locals.user?.accountType == AccountType.Student) {
        const studentObject = {
            createdProject: false,
            uploadedReportLength: 0,
            acquiredAdvisorApproval: false,
            imagesAdded: 0 
        }

        const project = await ProjectSchema.findOne({
            year: new Date().getFullYear(),
            studentId: locals.user.id
        }, 'fullReport underReview')

        if(project) {
            studentObject.createdProject = true;
            studentObject.uploadedReportLength = project.fullReport?.length || 0;
            if(!project.underReview) studentObject.acquiredAdvisorApproval = true;
            studentObject.imagesAdded = await ImageSchema.find({ projectId: project._id }).count();
        }

        returnObject.student = studentObject;
    } else if(locals.user?.accountType == AccountType.Advisor) {
        const adviseeCount = locals.user.adviseeIds.length;
        const advisorObject = {
            notVisited: adviseeCount,
            notCreatedProjects: adviseeCount,
            notUploadedReports: adviseeCount,
            notApproved: adviseeCount,
            notHaveImages: adviseeCount
        }

        const advisees = await UserSchema.find({
            schoolId: locals.user.adviseeIds
        }, 'lastVisit')

        advisees.forEach(a => {
            if(a.lastVisit?.getFullYear() == new Date().getFullYear()) advisorObject.notVisited--;
        })

        const projects = await ProjectSchema.find({
            year: new Date().getFullYear(),
            studentId: { $in: advisees.map(a => a._id) }
        }, 'fullReport underReview')

        await projects.forEach(async p => {
            advisorObject.notCreatedProjects--;
            if(p.fullReport) advisorObject.notUploadedReports--;
            if(!p.underReview) advisorObject.notApproved--;
            if(await ImageSchema.find({ projectId: p._id }).count() > 0) advisorObject.notHaveImages--;
        })

        returnObject.advisor = advisorObject;
    }
    
    if(locals.user?.accessLevel == AccessLevel.Admin) {
        // const adminObject = {
        //     unapprovedProjects: 
        // }

        // returnObject.admin = adminObject

        // TODO: upload new incoming class, projects not created, projects not approved
    }

    return { checklist: returnObject };
}