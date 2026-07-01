import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@taskflow/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MembersService } from './members.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@ApiTags('成员')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workspaces/:workspaceId/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @ApiOperation({ summary: '成员列表（所有成员可查）' })
  findAll(@Param('workspaceId', ParseUUIDPipe) workspaceId: string) {
    return this.membersService.findAll(workspaceId);
  }

  @Post()
  @Roles(Role.ADMIN) // 只有 OWNER/ADMIN 能邀请
  @ApiOperation({ summary: '邀请成员（ADMIN+）' })
  invite(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.membersService.invite(workspaceId, dto);
  }

  @Patch(':userId')
  @Roles(Role.ADMIN) // 只有 OWNER/ADMIN 能改角色
  @ApiOperation({ summary: '修改成员角色（ADMIN+）' })
  updateRole(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.membersService.updateRole(workspaceId, userId, dto.role, currentUserId);
  }

  @Delete(':userId')
  @Roles(Role.ADMIN) // 只有 OWNER/ADMIN 能移除
  @ApiOperation({ summary: '移除成员（ADMIN+）' })
  remove(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.membersService.remove(workspaceId, userId, currentUserId);
  }
}
