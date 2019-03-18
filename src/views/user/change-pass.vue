<template>
  <section class="app-container">
    <el-col :span="12">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>修改密码</span>
          <el-button @click="changePassword()" style="float: right; padding: 3px 0" type="text">确认修改</el-button>
        </div>
        <el-form
          :model="formPassword"
          :rules="resetFormRules"
          ref="formPassword"
          labelWidth="80px"
          label-position="left"
        >
          <el-form-item label="旧密码" prop="oldPassword">
            <el-input
              type="password"
              v-model="formPassword.oldPassword"
              auto-complete="off"
              placeholder="请输入旧密码"
            ></el-input>
          </el-form-item>
          <el-form-item v-if="visible" label="新密码" prop="surePassword">
            <el-input
              type="password"
              v-model="formPassword.surePassword"
              auto-complete="off"
              placeholder="请输入新密码"
            >
              <i
                slot="suffix"
                title="显示密码"
                @click="changePass('show')"
                style="cursor:pointer;"
                class="el-icon-view el-input__icon"
              ></i>
            </el-input>
          </el-form-item>
          <el-form-item v-else label="确认密码">
            <el-input type="text" v-model="formPassword.surePassword" placeholder="确认密码">
              <i
                slot="suffix"
                title="隐藏密码"
                @click="changePass('hide')"
                style="cursor:pointer;"
                class="el-icon-view el-input__icon"
              ></i>
            </el-input>
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input type="text" v-model="formPassword.newPassword" placeholder="请输入新密码">
              <i
                slot="suffix"
                title="隐藏密码"
                @click="changePass('hide')"
                style="cursor:pointer;"
                class="el-icon-view el-input__icon"
              ></i>
            </el-input>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </section>
</template>
<script>
import { changePass } from "@/api/user";

export default {
  name: "ChangePass",
  data() {
    var validatePass = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入新密码"));
      } else if (value.toString().length < 6 || value.toString().length > 18) {
        callback(new Error("密码长度为6 - 18个字符"));
      } else {
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.formPassword.oldPassword) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      formPassword: {
        oldPassword: "",
        surePassword: "",
        newPassword: ""
      },
      visible: true,
      resetFormRules: {
        oldPassword: [
          { required: true, validator: validatePass, trigger: "blur" }
        ],
        surePassword: [
          { required: true, validator: validatePass2, trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    changePass(value) {
      this.visible = !(value === "show");
    }, //判断渲染，true:暗文显示，false:明文显示
    changePassword() {
      if (
        this.formPassword.oldPassword != null &&
        this.formPassword.surePassword != null &&
        this.formPassword.newPassword != null
      ) {
        const para = {
          oldPassword: this.formPassword.oldPassword,
          newPassword: this.formPassword.newPassword
        };
        this.$confirm("确认删除该记录吗?", "提示", {
          type: "warning"
        })
          .then(() => {
            changePass(para).then(res => {
              this.$message({
                message: "修改成功",
                type: "success"
              });
              this.$store.dispatch("LogOut").then(() => {
                console.log("退出结束");
                location.reload(); // In order to re-instantiate the vue-router object to avoid bugs
              });
            });
          })
          .catch(() => {});
      }
    }
  }
};
</script>
<style scoped>
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}
</style>
