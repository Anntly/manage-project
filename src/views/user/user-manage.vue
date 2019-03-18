<template>
  <section class="app-container">
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item>
          <el-input v-model="filters.id" placeholder="ID"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.phone" placeholder="手机号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.email" placeholder="邮箱"></el-input>
        </el-form-item>
        <el-form-item>
          <el-switch active-text="普通" inactive-text="会员" v-model="filters.member"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-switch active-text="正常" inactive-text="封禁" v-model="filters.userStatus"></el-switch>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="filters.roleId" clearable filterable placeholder="请选择菜品(参考菜品)">
            <el-option
              :loading="loading"
              v-for="item in roles"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getUsers">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table
      :data="users"
      :default-sort="{prop: 'id', order: 'descending'}"
      @sort-change="handleSortChange"
      stripe
      highlight-current-row
      @selection-change="selsChange"
      style="min-width: 100%;"
      v-loading="loading"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column sortable="custom" prop="id" label="ID"></el-table-column>
      <el-table-column prop="username" label="用户名"></el-table-column>
      <el-table-column prop="phone" label="手机号"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="icon" label="头像">
        <!-- 图片的显示 -->
        <template slot-scope="scope">
          <img :src="scope.row.icon" min-width="70" height="70">
        </template>
      </el-table-column>
      <el-table-column prop="member" label="普通/会员">
        <template scope="scope">
          <el-switch
            on-text="普通"
            off-text="会员"
            v-model="scope.row.member"
            @change="changeMember(scope.$index,scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="userStatus" label="正常/封禁">
        <template scope="scope">
          <el-switch
            on-text="正常"
            off-text="封禁"
            active-color="#13ce66"
            inactive-color="#ff4949"
            v-model="scope.row.userStatus"
            @change="changeMember(scope.$index,scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column sortable="custom" prop="create_time" label="更新时间" width="120"></el-table-column>
      <el-table-column sortable="custom" prop="update_time" label="更新时间" width="120"></el-table-column>
      <el-table-column sortable="custom" prop="last_login_time" label="上次登录" width="120"></el-table-column>

      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination
        layout="total,prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        :total="this.total"
        :page-size="10"
        style="float:right;"
      ></el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="ID" prop="id">
          <el-input v-model="editForm.id" auto-complete="off" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input @blur="checkUsername()" v-model="editForm.username" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input @blur="checkPhone()" v-model="editForm.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input @blur="checkEmail()" v-model="editForm.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'create'" label="密码" prop="password">
          <el-input v-model="editForm.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="头像" prop="icon">
          <img v-if="dialogStatus === 'update'" :src="editForm.icon" alt="头像">
          <el-upload
            action="http://api.anntly.com/api/upload/image"
            list-type="picture-card"
            accept="image/*"
            :limit="imgLimit"
            :file-list="productImgs"
            :multiple="isMultiple"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :on-exceed="handleExceed"
            :on-error="imgUploadError"
            :with-credentials="true"
            :headers="myHeaders"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt>
          </el-dialog>
        </el-form-item>
        <el-form-item label="会员" prop="member">
          <el-switch active-text="普通" inactive-text="会员" v-model="editForm.member"></el-switch>
        </el-form-item>
        <el-form-item label="是否封禁" prop="userStatus">
          <el-switch active-text="正常" inactive-text="封禁" v-model="editForm.userStatus"></el-switch>
        </el-form-item>
        <el-form-item label="角色选择" prop="roles">
          <el-select v-model="selectedOptions" multiple placeholder="请选择">
            <el-option v-for="item in roles" :key="item.value" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="dialogFormVisible=false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" :disabled="isExist" @click="createData">添加</el-button>
        <el-button v-else type="primary" @click="updateData">修改</el-button>
      </div>
    </el-dialog>
  </section>
</template>
<script>
import {
  checkUser,
  getRoleNodes,
  getUserPage,
  removetUser,
  editUser,
  addUser
} from "@/api/user";
import QS from "qs";
import { Message, MessageBox } from "element-ui";

var token = `Bearer ${localStorage.JWT_TOKEN}`; // 要保证取到

export default {
  name: "UserManage",
  data() {
    return {
      isExist: false,
      myHeaders: { Authorization: token },
      dialogImageUrl: "",
      dialogVisible: false,
      productImgs: [], // 文件列表
      isMultiple: true,
      imgLimit: 1, // 上传文件数量
      dialogStatus: "",
      roles: [], // 获取的权限
      loading: true,
      options: [], // 级联选择器结果
      childrens: [], //所有的子节点
      selectedOptions: [], // 用户 edit时，回显的数据
      textMap: {
        update: "Edit",
        create: "Create"
      },
      dialogFormVisible: false,
      filters: {
        id: null,
        username: "",
        phone: "",
        email: "",
        member: "",
        userStatus: "",
        roleId: null
      },
      key: "",
      users: [],
      total: 0,
      totalPage: 0,
      page: 1,
      sortBy: "",
      desc: false,
      sels: [], // 列表选中列
      editFormRules: {},
      // 编辑界面数据
      editForm: {
        id: 0,
        username: "",
        password: "",
        phone: "",
        email: "",
        icon: "",
        member: true,
        userStatus: true,
        roles: ""
      },

      addFormVisible: false, // 新增界面是否显示
      addFormRules: {},
      dialogImageUrl: "",
      dialogVisible: false,
      productImgs: [], // 文件列表
      isMultiple: true,
      imgLimit: 1, // 上传文件数量
      dialogStatus: ""
    };
  },
  methods: {
    checkPhone() {
      const para = {
        phone: this.editForm.phone
      };
      checkUser(para).then(res => {
        if (res) {
          this.$message({
            message: "手机号已绑定",
            type: "danger"
          });
          this.isExist = true;
        } else {
          this.isExist = false;
        }
      });
    },
    checkEmail() {
      const para = {
        email: this.editForm.email
      };
      checkUser(para).then(res => {
        if (res) {
          this.$message({
            message: "邮箱已绑定",
            type: "danger"
          });
          this.isExist = true;
        } else {
          this.isExist = false;
        }
      });
    },
    checkUsername() {
      const para = {
        username: this.editForm.username
      };
      checkUser(para).then(res => {
        if (res) {
          this.$message({
            message: "用户已存在",
            type: "danger"
          });
          this.isExist = true;
        } else {
          this.isExist = false;
        }
      });
    },
    handleRemove(file, fileList) {
      //移除图片
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      //预览图片时调用
      console.log(file);
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    beforeAvatarUpload(file) {
      //文件上传之前调用做一些拦截限制
      console.log(file);
      const isJPG = true;
      // const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      // if (!isJPG) {
      //   this.$message.error('上传头像图片只能是 JPG 格式!');
      // }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    handleAvatarSuccess(res, file) {
      //图片上传成功
      this.editForm.icon = res;
    },
    handleExceed(files, fileList) {
      //图片上传超过数量限制
      this.$message.error("上传图片不能超过1张!");
      console.log(file, fileList);
    },
    imgUploadError(err, file, fileList) {
      //图片上传失败调用
      console.log(err);
      this.$message.error("上传图片失败!");
    },
    getRolePermissions(roleId) {
      getRoleNodes(roleId).then(res => {
        const arr = [];
        for (var i in res) {
          arr.push(res[i].id);
        }
        this.selectedOptions = arr;
      });
    },
    // 获取权限列表
    getUserRoles(userId) {
      getRoleNodes(userId).then(res => {
        this.roles = res;
      });
    },
    // 性别显示转换
    formatSex: function(row, column) {
      return row.sex === 1 ? "男" : row.sex === 0 ? "女" : "未知";
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getUsers();
    },
    // 处理filters的数据
    checkObj(para) {
      para.key = JSON.stringify(this.filters);
      getUserPage(para)
        .then(res => {
          this.total = res.total;
          this.totalPage = res.totalPage;
          this.users = res.items;
          this.loading = false;
          this.filters = {};
        })
        .catch();
    },
    // 获取用户列表
    getUsers() {
      const para = {
        key: this.filters,
        page: this.page,
        sortBy: this.sortBy,
        desc: this.desc
      };
      this.checkObj(para);
    },
    // 删除
    handleDel(index, row) {
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning"
      })
        .then(() => {
          removetUser(row.id).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getUsers();
          });
        })
        .catch(() => {});
    },
    // 显示编辑界面
    handleEdit(index, row) {
      this.getRolePermissions(row.id);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.editForm = Object.assign({}, row);
    },
    // 显示新增界面
    handleAdd() {
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.editForm = {
        id: 0,
        username: "",
        password: "",
        phone: "",
        email: "",
        icon: "",
        member: true,
        userStatus: true,
        roles: ""
      };
    },
    // 编辑
    updateData() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {})
            .then(() => {
              this.editForm.roles = JSON.stringify(this.selectedOptions);
              const para = QS.stringify(this.editForm);
              editUser(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.selectedOptions = [];
                this.getUsers();
              });
            })
            .catch(e => {
              // 打印一下错误
              console.log(e);
            });
        }
      });
    },
    // 新增
    createData: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {})
            .then(() => {
              this.editForm.roles = JSON.stringify(this.selectedOptions);
              // const para = Object.assign({}, this.editForm);
              const para = QS.stringify(this.editForm);
              addUser(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.selectedOptions = [];
                this.getUsers();
              });
            })
            .catch(e => {
              // 打印一下错误
              console.log(e);
            });
        }
      });
    },
    // 全选单选多选
    selsChange(sels) {
      this.sels = sels;
    },
    // 批量删除
    batchRemove() {
      var ids = this.sels.map(item => item.id).toString();
      this.$confirm(
        "确认删除选中记录吗(会删除该菜单下的所有菜品与分类)？",
        "提示",
        {
          type: "warning"
        }
      )
        .then(() => {
          const para = { ids: ids };
          batchRemoveMenu(para).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getUsers();
          });
        })
        .catch(() => {});
    },
    // 排序
    handleSortChange(column) {
      this.sortBy = column.prop;
      this.desc = column.order === "ascending";
      this.getUsers();
    }
  },
  created() {},
  mounted() {
    this.getUsers();
    this.getUserRoles();
  }
};
</script>
<style scoped>
.el-dropdown {
  vertical-align: top;
}
.el-dropdown + .el-dropdown {
  margin-left: 15px;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
