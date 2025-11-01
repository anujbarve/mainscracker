"use client";

import * as React from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useAdminStore } from "@/stores/admin";
import { BlogPost } from "@/lib/blog-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, PlusCircle, Trash2, Edit, Eye, Search } from "lucide-react";
import { toast } from "sonner";

export default function BlogPage() {
  const { blogPosts, fetchBlogPosts, deleteBlogPost, loading } = useAdminStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    fetchBlogPosts({ includeInactive: true });
  }, [fetchBlogPosts]);

  const filteredPosts = React.useMemo(() => {
    if (!blogPosts) return [];
    if (!searchQuery) return blogPosts;
    
    const query = searchQuery.toLowerCase();
    return blogPosts.filter((post) =>
      post.title.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [blogPosts, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    
    const success = await deleteBlogPost(id);
    if (success) {
      fetchBlogPosts({ includeInactive: true, force: true });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blog Posts</h2>
          <p className="text-muted-foreground">Manage your blog articles</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Post
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BlogTable posts={filteredPosts} onDelete={handleDelete} loading={loading.blogPosts} />
        </CardContent>
      </Card>
    </div>
  );
}

function BlogTable({ 
  posts, 
  onDelete, 
  loading 
}: { 
  posts: BlogPost[]; 
  onDelete: (id: string) => void;
  loading: boolean;
}) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns: ColumnDef<BlogPost>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <Link 
          href={`/admin/blog/${row.original.id}`} 
          className="font-medium text-primary hover:underline"
        >
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.category}</Badge>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        row.original.is_active ? (
          <Badge>Published</Badge>
        ) : (
          <Badge variant="outline">Draft</Badge>
        )
      ),
    },
    {
      accessorKey: "published_at",
      header: "Published",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.published_at 
            ? new Date(row.original.published_at).toLocaleDateString()
            : "Not published"}
        </span>
      ),
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.author.name}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/blog/${row.original.slug}`)}>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/admin/blog/${row.original.id}`)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: posts || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No posts found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {posts.length > 10 && (
        <div className="flex items-center justify-end space-x-2 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

