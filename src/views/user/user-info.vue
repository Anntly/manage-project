<template>
  <section class="app-container">
    <el-col :span="12">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>修改信息</span>
          <el-button
            :disabled="isExist"
            @click="changeInfo()"
            style="float: right; padding: 3px 0"
            type="text"
          >确认修改</el-button>
        </div>
        <el-form :model="UserInfo">
          <el-form-item label="ID" prop="id">
            <el-input type="text" :disabled="true" v-model="UserInfo.id" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input
              type="text"
              v-model="UserInfo.username"
              auto-complete="off"
              placeholder="请输入用户名"
              @blur="checkUsername()"
            ></el-input>
          </el-form-item>
          <el-form-item label="昵称" prop="nickName">
            <el-input
              type="text"
              v-model="UserInfo.nickName"
              auto-complete="off"
              placeholder="请输入昵称"
            ></el-input>
          </el-form-item>
          <el-form-item label="年龄" prop="age">
            <el-input v-model="UserInfo.age" auto-complete="off" placeholder="请输入年龄"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input
              type="text"
              @blur="checkPhone()"
              v-model="UserInfo.phone"
              auto-complete="off"
              placeholder="请输入手机号"
            ></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input
              type="text"
              @blur="checkEmail()"
              v-model="UserInfo.email"
              auto-complete="off"
              placeholder="请输入邮箱"
            ></el-input>
          </el-form-item>
          <img :src="UserInfo.icon" alt="头像">
          <el-form-item label="图片" prop="icon">
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
          <el-form-item label="性别" prop="sex">
            <el-switch active-text="男" inactive-text="女" v-model="UserInfo.sex"></el-switch>
          </el-form-item>
          <el-form-item label="生日" prop="birthday">
            <el-date-picker
              type="date"
              placeholder="选择日期"
              v-model="UserInfo.birthday"
              style="width: 100%;"
              @change="dateChangebirthday"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
          </el-form-item>
        </el-form>
        <el-form-item label="个性签名" prop="underwrite">
          <el-input type="textarea" v-model="UserInfo.underwrite"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input type="text" v-model="UserInfo.address" auto-complete="off" placeholder="请输入地址"></el-input>
        </el-form-item>
      </el-card>
    </el-col>
  </section>
</template>
<script>
import { checkUser, getUserInfo, changeUserInfo } from "@/api/user";

var token = `Bearer ${localStorage.JWT_TOKEN}`; // 要保证取到

export default {
  name: "UserInfo",
  data() {
    return {
      isExist: false,
      UserInfo: {
        id: null,
        username: "",
        phone: "",
        email: "",
        icon: "",
        sex: true,
        birthday: null,
        nickName: "",
        age: 0,
        underwrite: "",
        address: ""
      },
      myHeaders: { Authorization: token },
      dialogImageUrl: "",
      dialogVisible: false,
      productImgs: [], // 文件列表
      isMultiple: true,
      imgLimit: 1, // 上传文件数量
      dialogStatus: ""
    };
  },
  methods: {
    dateChangebirthday(val) {
      console.log(val);
      this.form.birthdayName = val;
    },
    getInfo() {
      getUserInfo().then(res => {
        this.UserInfo = res;
      });
    },
    checkPhone() {
      const para = {
        phone: this.UserInfo.phone
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
        email: this.UserInfo.email
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
        username: this.UserInfo.username
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
    changeInfo() {
      this.$confirm("确认修改吗？", "提示", {})
        .then(() => {
          const para = Object.assign({}, this.UserInfo);
          changeUserInfo(para).then(res => {
            this.$message({
              message: "修改成功",
              type: "success"
            });
            this.getInfo();
            this.dialogFormVisible = false;
          });
        })
        .catch(e => {
          // 打印一下错误
          console.log(e);
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
      this.UserInfo.icon = res;
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
    }
  },
  mounted() {
    this.getInfo();
  }
};
</script>
<style scoped>
</style>
