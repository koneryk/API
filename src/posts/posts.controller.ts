import { Body, Controller, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CreatePostDto } from '../users/dto/create-post.dto';
import { PostsService } from './posts.service';
import { Post } from "@nestjs/common"
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @Post()
  @UseInterceptors(FileInterceptor('image'))

  createPost(@Body() dto: CreatePostDto,@UploadedFile() image,) {

    return this.postsService.create(dto, image)

  }
}
