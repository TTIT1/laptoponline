

package com.example.springbootlaptoop.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.springbootlaptoop.dto.resquest.UserResgest;
import com.example.springbootlaptoop.model.User;
import com.example.springbootlaptoop.repository.UserRepository;
@Service
public class UserService {
   
      @Autowired
      private UserRepository userrepository;
      
      @Autowired
      private BCryptPasswordEncoder bCryptPasswordEncoder;
      public Boolean resgiest(UserResgest resgest){
        
         if(!userrepository.findByUsername(resgest.getUsername()).isPresent()){

          
          User user = new User();
            user.setEmail(resgest.getEmail());
            user.setUsername(resgest.getUsername());
            user.setPassword(bCryptPasswordEncoder.encode(resgest.getPassword()));
            user.setRole("User");
            userrepository.save(user);
           
     
         return true;
         }

       return false;
       
      }

      // public UserResponse login(String name,String password){
      //   User u =
  

} 