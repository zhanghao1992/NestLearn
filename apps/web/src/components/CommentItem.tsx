'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Comment } from '@/lib/comment-api';
import { deleteComment } from '@/lib/comment-api';

export function CommentItem({
  comment,
  canDelete,
}: {
  comment: Comment;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    if (!confirm('删除这条评论？')) return;
    setBusy(true);
    try {
      await deleteComment(comment.id);
      router.refresh();
    } catch {
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
        {comment.user.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.user.name}</span>
          <span className="text-xs text-gray-400">
            {new Date(comment.createdAt).toLocaleString('zh-CN')}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-gray-700">{comment.content}</p>
      </div>
      {canDelete && (
        <button
          onClick={onDelete}
          disabled={busy}
          className="self-start text-xs text-gray-400 hover:text-red-500"
        >
          删除
        </button>
      )}
    </div>
  );
}
