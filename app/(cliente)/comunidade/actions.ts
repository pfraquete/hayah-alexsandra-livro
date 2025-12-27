'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleLikeAction(postId: string, currentLikeStatus: boolean) {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) return { error: "Usuário não autenticado" };

    try {
        if (currentLikeStatus) {
            await supabase
                .from('community_likes')
                .delete()
                .match({ post_id: postId, user_id: user.id });
        } else {
            await supabase
                .from('community_likes')
                .insert({ post_id: postId, user_id: user.id });
        }

        revalidatePath('/comunidade');
        return { success: true };
    } catch (error) {
        console.error("Erro no like:", error);
        return { error: "Erro ao processar curtida" };
    }
}

export async function addCommentAction(postId: string, content: string) {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) return { error: "Usuário não autenticado" };
    if (!content.trim()) return { error: "Comentário vazio" };

    try {
        const { error } = await supabase
            .from('community_comments')
            .insert({
                post_id: postId,
                user_id: user.id,
                content: content
            });

        if (error) throw error;

        revalidatePath('/comunidade');
        return { success: true };
    } catch (error) {
        console.error("Erro no comentário:", error);
        return { error: "Erro ao publicar comentário" };
    }
}
