import { ProjectSchema } from '@/server/mongo/schemas/project';
import { json } from '@sveltejs/kit';

export async function POST({ request, params: { projectId } }) {
    const { fullReport } = await request.json();

    await ProjectSchema.findOneAndUpdate({
        _id: projectId
    }, { fullReport })

    return json({ message: "Report updated successfully!" });
}








